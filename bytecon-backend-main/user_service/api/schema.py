from datetime import datetime
import typing
import strawberry
from enum import Enum
from typing import Annotated
from strawberry.permission import BasePermission
from pydantic import BaseModel

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


class TokenData(BaseModel):
    id: int
    email: str

class EmailTokenModel(BaseModel):
    user_id: int | None
    token: str
    expiration: datetime

    class Config:
        orm_mode = True

class UserModel(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    password: str
    
    class Config:
        orm_mode = True

@strawberry.experimental.pydantic.type(model=UserModel)
class User:
    id: strawberry.auto
    email: strawberry.auto
    first_name: strawberry.auto
    last_name: strawberry.auto

@strawberry.type
class Token:
    token: str

@strawberry.type
class LoginPayload:
    token: Token
    user: User

@strawberry.input
class CreateUserInput:
    email: str
    password: str
    first_name: str
    last_name: str

@strawberry.input
class LoginUserInput:
    email: str
    password: str

@strawberry.input
class ChangePasswordInput:
    old_password: str
    new_password: str

@strawberry.input
class RequestPasswordResetInput:
    email: str

@strawberry.input
class PasswordResetInput:
    new_password: str
    email_token: str

@strawberry.input
class EditBioInput:
    bio: str

@strawberry.input
class EditInterestsInput:
    interests: list[Tags]

@strawberry.input
class EditImageInput:
    image: str   

@strawberry.input
class EditNameInput:
    first_name: str
    last_name: str

@strawberry.enum
class ErrorType(Enum):
    LOGIN_ERROR = "LOGIN_ERROR"
    USER_EXISTS_ERROR = "USER_EXISTS_ERROR"
    INVALID_PASSWORD = "INVALID_PASSWORD"
    RESET_REQUEST_FAIL = "RESET_REQUEST_FAIL"
    RESET_FAIL = "RESET_FAIL"

@strawberry.type
class Error:
    msg: str
    code: ErrorType

@strawberry.type
class UserProfile:
    user: User
    bio: str
    interests: list[Tags]
    image: str

@strawberry.type
class IDReturn:
    id: strawberry.ID

CreateUserResult = Annotated[LoginPayload | Error, strawberry.union(name="CreateUserResult")]

LoginResult = Annotated[LoginPayload | Error, strawberry.union(name="LoginResult")]

ChangePasswordResult = Annotated[IDReturn | Error, strawberry.union(name="ChangePasswordResult")]

ResetRequestResult = Annotated[IDReturn | Error, strawberry.union(name="ResetRequestResult")]

PasswordResetResult = Annotated[IDReturn | Error, strawberry.union(name="PasswordResetResult")]

EditBioResult = Annotated[IDReturn | Error, strawberry.union(name="EditBioResult")]

EditInterestsResult = Annotated[IDReturn | Error, strawberry.union(name="EditInterestsResult")]

EditProfilePicResult = Annotated[IDReturn | Error, strawberry.union(name="EditProfilePicResult")]

EditNameResult = Annotated[IDReturn | Error, strawberry.union(name="EditNameResult")]

class IsAuthenticated(BasePermission):
    message = "User is not authenticated"
    error_extensions = {"code": "UNAUTHORIZED"}

    async def has_permission(self, source: typing.Any, info: strawberry.Info, **kwargs) -> bool:
        return info.context.user is not None
