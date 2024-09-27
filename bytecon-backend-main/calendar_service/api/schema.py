import typing
from pydantic import BaseModel
import strawberry
from enum import Enum
from typing import Annotated
from datetime import datetime



class TokenData(BaseModel):
    id: int
    email: str

@strawberry.enum
class Tags(Enum):
    ARTIFICIAL_INTELLIGENCE = "ARTIFICIAL INTELLIGENCE"
    WEB_APPS = "WEB APPS"
    CRYPTOGRAPHY = "CRYPTOGRAPHY"
    ROBOTICS = "ROBOTICS"
    COMPETITIVE_PROGRAMMING = "COMPETITIVE PROGRAMMING"
    EMBEDDED_SYSTEMS = "EMBEDDED SYSTEMS"
    UX_DESIGN = "UX DESIGN"
    NETWORKS = "NETWORKS"
    DATABASES = "DATABASES"
    SYSTEM_DESIGN = "SYSTEM_DESIGN"

class EventPyModel(BaseModel):
    id: int
    name: str
    description: str
    location: str
    tags: list[Tags]
    created_by: int | None
    datetime: datetime
    
    class Config:
        orm_mode = True

@strawberry.experimental.pydantic.type(model=EventPyModel)
class Event:
    id: strawberry.auto
    name: strawberry.auto
    tags: strawberry.auto
    location: strawberry.auto
    description: strawberry.auto
    created_by: strawberry.auto
    datetime: strawberry.auto

@strawberry.input
class EventInput:
    event_id: int
    name: str
    description: str
    location: str
    tags: list[Tags]
    created_by: int | None
    datetime: datetime

@strawberry.input
class GetCalendarInput:
    datetime: datetime

@strawberry.type
class GetCalendarResult:
    calendar: list[Event]

@strawberry.type
class Success:
    success: bool

@strawberry.enum
class ErrorType(Enum):
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"

@strawberry.type
class Error:
    msg: str
    code: ErrorType

addToCalendarResult = Annotated[Success | Error, strawberry.union(name="addToCalendarResult")]

removeFromCalendarResult = Annotated[Success | Error, strawberry.union(name="removeFromCalendarResult")]

class IsAuthenticated(strawberry.BasePermission):
    message = "User is not authenticated"
    error_extensions = {"code": "UNAUTHORIZED"}

    async def has_permission(self, source: typing.Any, info: strawberry.Info, **kwargs) -> bool:
        return info.context.user is not None
