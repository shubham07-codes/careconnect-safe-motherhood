from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.content import ArticleRead, ContentArticle, ContentCategory
from app.models.mother import Mother
from app.models.user import User
from app.schemas.content import ArticleStateRequest

router = APIRouter(
    prefix="/api/mother/content",
    tags=["Mother - Care & Learn"],
)

@router.get("")
def list_content(
    language: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("mother")),
):
    stmt = (
        select(ContentArticle, ContentCategory)
        .join(ContentCategory, ContentArticle.category_id == ContentCategory.id)
        .where(ContentArticle.is_published.is_(True))
    )

    if language:
        stmt = stmt.where(ContentArticle.language == language)

    if category:
        stmt = stmt.where(ContentCategory.slug == category)

    rows = db.execute(
        stmt.order_by(ContentArticle.created_at.desc())
    ).all()

    return [
        {
            "id": article.id,
            "title": article.title,
            "slug": article.slug,
            "summary": article.summary,
            "language": article.language,
            "content_type": article.content_type,
            "category": category_row.name,
        }
        for article, category_row in rows
    ]

@router.get("/saved")
def saved_content(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("mother")),
):
    mother = db.scalar(
        select(Mother).where(Mother.user_id == user.id)
    )

    if mother is None:
        raise HTTPException(status_code=404, detail="Mother profile not linked.")

    rows = db.execute(
        select(ContentArticle, ArticleRead)
        .join(ArticleRead, ContentArticle.id == ArticleRead.article_id)
        .where(
            ArticleRead.mother_id == mother.id,
            ArticleRead.saved.is_(True),
        )
    ).all()

    return [
        {
            "id": article.id,
            "title": article.title,
            "summary": article.summary,
            "language": article.language,
            "completed": state.completed,
            "saved": state.saved,
        }
        for article, state in rows
    ]

@router.get("/{article_id}")
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("mother")),
):
    article = db.get(ContentArticle, article_id)

    if article is None or not article.is_published:
        raise HTTPException(status_code=404, detail="Article not found.")

    return {
        "id": article.id,
        "title": article.title,
        "summary": article.summary,
        "content": article.content,
        "language": article.language,
        "content_type": article.content_type,
    }

@router.post("/{article_id}/state")
def set_article_state(
    article_id: int,
    payload: ArticleStateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("mother")),
):
    mother = db.scalar(
        select(Mother).where(Mother.user_id == user.id)
    )

    if mother is None:
        raise HTTPException(status_code=404, detail="Mother profile not linked.")

    article = db.get(ContentArticle, article_id)

    if article is None:
        raise HTTPException(status_code=404, detail="Article not found.")

    state = db.scalar(
        select(ArticleRead).where(
            ArticleRead.mother_id == mother.id,
            ArticleRead.article_id == article.id,
        )
    )

    if state is None:
        state = ArticleRead(
            mother_id=mother.id,
            article_id=article.id,
        )
        db.add(state)

    if payload.completed is not None:
        state.completed = payload.completed

    if payload.saved is not None:
        state.saved = payload.saved

    db.commit()

    return {
        "article_id": article.id,
        "completed": state.completed,
        "saved": state.saved,
    }
