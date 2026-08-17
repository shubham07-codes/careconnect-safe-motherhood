from pydantic import BaseModel

class ArticleStateRequest(BaseModel):
    completed: bool | None = None
    saved: bool | None = None
