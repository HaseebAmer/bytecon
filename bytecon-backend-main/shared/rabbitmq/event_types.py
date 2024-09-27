from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class MessageType(Enum):
    DELETEUSER = 1
    EDITEVENT = 2
    DELETEEVENT = 3

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

class DeleteUser(BaseModel):
    message_type: MessageType
    user_id: int

class EditEvent(BaseModel):
    message_type: MessageType
    event_id: int
    name: str
    description: str
    location: str
    tags: list[Tags]
    created_by: int | None
    datetime: datetime

class DeleteEvent(BaseModel):
    message_type: MessageType
    event_id: int