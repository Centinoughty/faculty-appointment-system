import sqlalchemy as sa
from sqlalchemy import text
from database import engine
from models.models import Base
from sqlalchemy import inspect

def upgrade_schema():
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if not inspector.has_table(table_name):
                print(f"Table {table_name} missing. This should have been created by create_all.")
                continue

            existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
            for column in table.columns:
                if column.name not in existing_columns:
                    # Get the column type string (roughly)
                    col_type = column.type.compile(engine.dialect)
                    try:
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column.name} {col_type};"))
                        print(f"Auto-added column {table_name}.{column.name} ({col_type})")
                    except Exception as e:
                        print(f"Error adding {table_name}.{column.name}: {e}")

if __name__ == "__main__":
    upgrade_schema()
