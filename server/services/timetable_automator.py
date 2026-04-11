import json
import base64
import io
from pdf2image import convert_from_path
from config import client, MODEL_NAME, SLOT_TRANSLATOR, FACULTY_DB_MAP
from sqlalchemy.orm import Session
from sqlalchemy import text

EXTRACTION_PROMPT = """
You are a strict timetable parser. Look at this image of a timetable grid.
Extract ONLY faculty members TEACHING in the grid.
STRICT RULES:
1. IGNORE the faculty directory list at the bottom of the page completely.
2. IGNORE room codes (ELHC, MB, MC, NLHC).
3. IGNORE batch codes (CS01, S2-BTech, S2-MTech).
4. IGNORE course codes (CS1011E).
5. If a class says "OR", extract BOTH faculty members.
6. Extract EXACTLY what is inside the brackets (e.g. [SM] -> "SM", [Saket Chandra] -> "Saket Chandra").
7. Map the faculty to the exact SLOT CODE written at the top of their column (e.g., A1, P1, E1+).
8. Map the faculty to the exact DAY based on the grid layout (e.g., Monday, Tuesday).

Return ONLY a JSON array with keys: "faculty_identifier", "day", "slot_code".
Example: [{"faculty_identifier": "TMS", "day": "Monday", "slot_code": "D1+"}]
"""

def resolve_faculty_id(db: Session, identifier: str):
    """
    Hybrid Resolution: 
    1. SEARCHES DB by short_code/name FIRST (Most reliable).
    2. Then checks hardcoded map as a fallback.
    3. Finally verifies target ID actually exists.
    """
    identifier = identifier.strip()
    target_id = None
    
    # --- PHASE 1: DB Lookup (Search for real current data) ---
    # Match by Short Code (Case-Insensitive)
    row = db.execute(text("SELECT user_id FROM faculty WHERE upper(short_code) = upper(:id)"), {"id": identifier}).fetchone()
    if row: 
        target_id = row[0]
    
    if not target_id:
        # Match by Full Name (Exact, Case-Insensitive)
        row = db.execute(text(
            "SELECT f.user_id FROM faculty f JOIN users u ON f.user_id = u.id WHERE upper(u.name) = upper(:id)"
        ), {"id": identifier}).fetchone()
        if row: target_id = row[0]
        
    if not target_id:
        # Match by First Name (Fuzzy, Case-Insensitive)
        first_word = identifier.split()[0]
        row = db.execute(text(
            "SELECT f.user_id FROM faculty f JOIN users u ON f.user_id = u.id WHERE u.name ILIKE :name"
        ), {"name": f"%{first_word}%"}).fetchone()
        if row: target_id = row[0]

    # --- PHASE 2: Map Lookup (Fallback for special aliases) ---
    if not target_id and identifier in FACULTY_DB_MAP:
        target_id = FACULTY_DB_MAP[identifier]

    # --- PHASE 3: Safety Check (FK Verification) ---
    if target_id:
        # We must verify the user_id exists in the 'faculty' table
        exists = db.execute(text("SELECT user_id FROM faculty WHERE user_id = :id"), {"id": target_id}).fetchone()
        if exists:
            return target_id
            
    return None 

import csv

def parse_csv_timetable(csv_file_path: str) -> list:
    """
    Parses a CSV file with headers: faculty_identifier, slot_code.
    Supports comma-separated slot codes.
    Uses the native csv module for lightweight processing.
    Returns: [{"faculty_identifier": "...", "slot_code": "..."}]
    """
    results = []
    try:
        with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            # Normalize headers: strip and lowercase to be robust
            header_map = {h.lower().strip(): h for h in reader.fieldnames} if reader.fieldnames else {}
            
            faculty_key = header_map.get('faculty_identifier')
            slot_key = header_map.get('slot_code')
            
            if not faculty_key or not slot_key:
                print(f"Error: Missing required headers in CSV. Found: {reader.fieldnames}")
                return []

            for row in reader:
                identifier = str(row.get(faculty_key, '')).strip()
                slot_codes_raw = str(row.get(slot_key, '')).strip()
                
                if not identifier or not slot_codes_raw:
                    continue
                    
                # Split comma-separated codes (e.g., "A1, B2")
                codes = [c.strip() for c in slot_codes_raw.split(',') if c.strip()]
                for code in codes:
                    results.append({
                        "faculty_identifier": identifier,
                        "slot_code": code
                    })
    except Exception as e:
        print(f"Error parsing CSV: {e}")
    return results

def insert_slots_from_raw_data(db: Session, raw_data: list) -> dict:
    """
    Takes a list of records and inserts them into the slots table.
    If 'day' is missing in a record, it maps the 'slot_code' to ALL days it appears in SLOT_TRANSLATOR.
    """
    failed_extractions = []
    slots_to_insert = []
    
    # Pre-clear existing slots (as per original logic)
    db.execute(text("DELETE FROM slots"))
    db.commit()

    for record in raw_data:
        identifier = record.get('faculty_identifier')
        slot_code = record.get('slot_code')
        day_name = record.get('day') # May be None for CSV
        
        if not identifier or not slot_code:
            continue
            
        faculty_id = resolve_faculty_id(db, identifier)
        if not faculty_id:
            ignore_list = ["ELHC", "MB", "MC", "NLHC", "CS0", "S2-", "S4-", "S6-", "S8-", "DA-", "OE"]
            if not any(code in identifier for code in ignore_list):
                failed_extractions.append(f"Not in DB: '{identifier}'")
            continue

        # If day is specified (LLM PDF flow)
        if day_name:
            translation = SLOT_TRANSLATOR.get(day_name, {}).get(slot_code)
            if translation:
                day_int, start_time, end_time = translation
                slots_to_insert.append({
                    "faculty_id": faculty_id,
                    "day": day_int,
                    "start_time": start_time,
                    "end_time": end_time
                })
            else:
                failed_extractions.append(f"Slot Mismatch: '{slot_code}' on {day_name}")
        else:
            # If day is NOT specified (CSV flow), find all days this slot appears in
            found_any = False
            for d_name, slots in SLOT_TRANSLATOR.items():
                if slot_code in slots:
                    found_any = True
                    day_int, start_time, end_time = slots[slot_code]
                    slots_to_insert.append({
                        "faculty_id": faculty_id,
                        "day": day_int,
                        "start_time": start_time,
                        "end_time": end_time
                    })
            if not found_any:
                failed_extractions.append(f"Unknown Slot Code: '{slot_code}'")

    if slots_to_insert:
        sql = text("INSERT INTO slots (faculty_id, day, start_time, end_time) VALUES (:faculty_id, :day, :start_time, :end_time)")
        for s in slots_to_insert:
            db.execute(sql, s)
        db.commit()
    
    return {
        "success": True,
        "slots_generated": len(slots_to_insert),
        "errors_to_review": list(set(failed_extractions)) # Deduplicate errors
    }

def run_semester_setup(db: Session, file_path: str) -> dict:
    try:
        raw_json_data = []
        is_csv = file_path.lower().endswith('.csv')
        
        if is_csv:
            print(f"Step 1: Parsing CSV timetable: {file_path}")
            raw_json_data = parse_csv_timetable(file_path)
        else:
            # ORIGINAL PDF FLOW
            print("Step 1: Converting PDF to images...")
            images = convert_from_path(file_path, dpi=300)
            relevant_images = images[:2] 
            
            print(f"Step 2: Analyzing timetable images with {MODEL_NAME}...")
            for i, image in enumerate(relevant_images):
                buffered = io.BytesIO()
                image.save(buffered, format="JPEG")
                base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                response = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {"role": "system", "content": "You output strictly valid JSON arrays. No markdown, no text, just the JSON array."},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": EXTRACTION_PROMPT},
                                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                            ]
                        }
                    ],
                    temperature=0.0
                )
                
                raw_output = response.choices[0].message.content
                raw_output = raw_output.replace("```json", "").replace("```", "").strip()
                
                try:
                    if raw_output.startswith("["):
                        raw_json_data.extend(json.loads(raw_output))
                    else:
                        parsed = json.loads(raw_output)
                        raw_json_data.extend(next((v for v in parsed.values() if isinstance(v, list)), []))
                except Exception as e:
                    print(f"Failed to parse page {i+1} JSON: {e}")

        # ---------------------------------------------
        # STEP 3: Unified Insertion
        # ---------------------------------------------
        print(f"Step 3: Processing {len(raw_json_data)} entries...")
        return insert_slots_from_raw_data(db, raw_json_data)
        
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}