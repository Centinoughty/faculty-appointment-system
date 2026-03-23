import sqlalchemy as sa
from database import engine
from models.models import Base

def inspect_db():
    inspector = sa.inspect(engine)
    existing_tables = inspector.get_table_names()
    print("Existing tables:", existing_tables)
    for table in existing_tables:
        print(f"Table {table}: {len(inspector.get_columns(table))} columns")

if __name__ == "__main__":
    inspect_db()
