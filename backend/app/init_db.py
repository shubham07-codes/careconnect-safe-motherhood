from app.database import Base, SessionLocal, engine
import app.models  # noqa: F401
from app.models.ward import Ward

def create_tables():
    print("Creating / checking CareConnect tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables ready.")

def create_default_ward():
    db = SessionLocal()
    try:
        existing = db.query(Ward).filter(Ward.code == "WARD-12").first()
        if existing is None:
            db.add(
                Ward(
                    code="WARD-12",
                    name="Ward 12",
                    city="Nagpur",
                )
            )
            db.commit()
            print("Default Ward 12 created.")
        else:
            print("Default Ward 12 already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    create_default_ward()
    print("CareConnect database initialization complete.")
