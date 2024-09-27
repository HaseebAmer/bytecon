from datetime import datetime as dt
import typing
from pydantic import BaseModel
import strawberry
from enum import Enum
from typing import Annotated

class TokenData(BaseModel):
    id: int
    email: str

class SearchCursor(BaseModel):
    id: int
    relevance: int

class TagsCursor(BaseModel):
    id: int
    matching_tags: int

class Cursor(BaseModel):
    id: int

class DatetimeCursor(BaseModel):
    id: int
    datetime: dt

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

@strawberry.input
class EventInput:
    name: str
    tags: list[Tags]
    location: str
    description: str
    datetime: dt
    image: str | None = None

class EventPyModel(BaseModel):
    id: int
    name: str
    description: str
    location: str
    tags: list[Tags]
    created_by: int | None
    datetime: dt
    image: str | None
    
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
    image: strawberry.auto

@strawberry.type
class PageInfo:
    end_cursor: str | None
    has_next_page: bool

@strawberry.type
class EventEdge:
    cursor: str
    edge: Event    

@strawberry.type
class EventConnection:
    page_info: PageInfo
    edges: list[EventEdge]


@strawberry.input
class SearchFilter:
    search: str

@strawberry.input
class RelevanceFilter:
    tags: list[Tags]

@strawberry.input
class DateFilter:
    from_: dt | None = None
    to: dt | None = None

@strawberry.input(one_of=True)
class FilterType:
    search_filter: SearchFilter | None = strawberry.UNSET
    relevance_filter: RelevanceFilter | None = strawberry.UNSET
    date_filter: DateFilter | None = strawberry.UNSET

@strawberry.input
class GetEventInput:
    first: int | None = None
    after: str | None = None
    filter: FilterType | None = None

@strawberry.enum
class ErrorType(Enum):
    PERMISSION_ERROR = "PERMISSION_ERROR"
    BAD_REQUEST = "BAD_REQUEST"
    EVENT_EXISTS = "EVENT_EXISTS"
    EVENT_NOT_FOUND = "EVENT_NOT_FOUND"

@strawberry.type
class Error:
    msg: str
    code: ErrorType

@strawberry.type
class Success:
    success: bool

DeleteEventResult = Annotated[Success | Error, strawberry.union(name="DeleteEventResult")]

class EditEventModel(BaseModel):
    id: int
    name: str | None = None
    tags: list[Tags] | None = None
    location: str | None = None
    description: str | None = None
    datetime: dt | None = None 
    image: str | None = None

@strawberry.experimental.pydantic.input(model=EditEventModel)
class EditEvent:
    id: strawberry.auto
    name: strawberry.auto
    tags: strawberry.auto
    location: strawberry.auto
    description: strawberry.auto
    datetime: strawberry.auto
    image: strawberry.auto

EditEventResult = Annotated[Event | Error, strawberry.union(name="EditEventResult")]

GetEventsResult = Annotated[EventConnection | Error, strawberry.union(name="GetEventResult")]

CreateEventResult = Annotated[Event | Error, strawberry.union(name="CreateEventResult")]
GetSingleEventResult = Annotated[Event | Error, strawberry.union(name="GetSingleEventResult")]

class IsAuthenticated(strawberry.BasePermission):
    message = "User is not authenticated"
    error_extensions = {"code": "UNAUTHORIZED"}

    async def has_permission(self, source: typing.Any, info: strawberry.Info, **kwargs) -> bool:
        return info.context.user is not None