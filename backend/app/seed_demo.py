from datetime import date

from sqlalchemy import select

from app.database import SessionLocal
from app.models.content import ContentArticle, ContentCategory
from app.models.mother import Mother
from app.models.user import User
from app.models.ward import Ward
from app.security.password import hash_password

DEMO_PASSWORD = "Demo@123"

def user(db, full_name: str, email: str, role: str) -> User:
    existing = db.scalar(
        select(User).where(User.email == email)
    )
    if existing:
        return existing

    item = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(DEMO_PASSWORD),
        role=role,
        is_active=True,
    )
    db.add(item)
    db.flush()
    return item

def seed():
    db = SessionLocal()

    try:
        ward = db.scalar(
            select(Ward).where(Ward.code == "WARD-12")
        )

        if ward is None:
            ward = Ward(
                code="WARD-12",
                name="Ward 12",
                city="Nagpur",
            )
            db.add(ward)
            db.flush()

        user(
            db,
            "Demo ASHA",
            "asha@careconnect.demo",
            "field_worker",
        )

        user(
            db,
            "Demo Doctor",
            "doctor@careconnect.demo",
            "doctor",
        )

        user(
            db,
            "Demo Officer",
            "officer@careconnect.demo",
            "officer",
        )

        mother_user = user(
            db,
            "Demo Mother",
            "mother@careconnect.demo",
            "mother",
        )

        mother = db.scalar(
            select(Mother).where(
                Mother.user_id == mother_user.id
            )
        )

        if mother is None:
            db.add(
                Mother(
                    user_id=mother_user.id,
                    ward_id=ward.id,
                    full_name="Demo Mother",
                    phone="9000000000",
                    date_of_birth=date(1998, 5, 12),
                    preferred_language="marathi",
                    reminder_consent=True,
                )
            )

        category = db.scalar(
            select(ContentCategory).where(
                ContentCategory.slug == "newborn-care"
            )
        )

        if category is None:
            category = ContentCategory(
                name="Newborn Care",
                slug="newborn-care",
            )
            db.add(category)
            db.flush()

        article = db.scalar(
            select(ContentArticle).where(
                ContentArticle.slug == "newborn-care-basics"
            )
        )

        if article is None:
            db.add(
                ContentArticle(
                    category_id=category.id,
                    title="Newborn Care Basics",
                    slug="newborn-care-basics",
                    summary=(
                        "Simple newborn-care education for the Care & Learn section."
                    ),
                    content=(
                        "Keep scheduled newborn follow-ups and use guidance "
                        "reviewed by your care team. Seek clinical care promptly "
                        "for concerning symptoms. This demo article must be "
                        "reviewed by a qualified clinical mentor before deployment."
                    ),
                    language="english",
                    content_type="article",
                    is_published=True,
                )
            )

        db.commit()

        print("Demo seed complete.")
        print("Password for all demo users:", DEMO_PASSWORD)
        print("ASHA    : asha@careconnect.demo")
        print("Doctor  : doctor@careconnect.demo")
        print("Officer : officer@careconnect.demo")
        print("Mother  : mother@careconnect.demo")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
