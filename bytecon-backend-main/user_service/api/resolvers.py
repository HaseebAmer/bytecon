from datetime import datetime, timedelta, timezone
import json
from sqlalchemy import inspect
import strawberry
from sqlalchemy.future import select
        
from api.schema import ChangePasswordInput, ChangePasswordResult, CreateUserInput, CreateUserResult, EditBioInput, EditBioResult, EditInterestsInput, EditInterestsResult, EditImageInput, EditNameInput, EditProfilePicResult, EmailTokenModel, ErrorType, Error, IDReturn, IsAuthenticated, LoginPayload, LoginResult, LoginUserInput, PasswordResetInput, PasswordResetResult, RequestPasswordResetInput, ResetRequestResult, User, UserModel, Token, UserProfile, EditNameResult
from models import UserProfileTable, UserTable, EmailToken
from oauth2 import create_access_token
import app
from utils import hash_password, send_email, verify_password, generate_token
from models import get_session
import logging

logging = logging.getLogger()

async def create_user(self, input: CreateUserInput) -> CreateUserResult:
    async with get_session() as db:
        result = await db.execute(select(UserTable).filter(UserTable.email == input.email))
        existing_user = result.scalars().first()
        if existing_user:
            return Error(msg="User already exists", code=ErrorType.USER_EXISTS_ERROR)

        user = UserTable(
            email=input.email,
            first_name=input.first_name,
            last_name=input.last_name,
            password=hash_password(input.password),
        )
        db.add(user)
        await db.commit()

        token = create_access_token(data={"email": user.email, "id": user.id})
        user_dict = {c.key: getattr(user, c.key) for c in inspect(UserTable).mapper.column_attrs}

        return LoginPayload(user=User.from_pydantic(UserModel.model_validate(user_dict)), token=Token(token=token))


async def edit_bio(self, input: EditBioInput, info: strawberry.Info) -> EditBioResult:
    async with get_session() as db:
        user = info.context.user
        result = await db.execute(select(UserProfileTable).filter(UserProfileTable.id == user.id))
        user_profile = result.scalars().first()
        user_profile.bio = input.bio
        await db.commit()
    return IDReturn(id=strawberry.ID(str(user_profile.id)))

async def edit_name(self, input: EditNameInput, info: strawberry.Info) -> EditNameResult:
    async with get_session() as db:
        curr_user = info.context.user
        result = await db.execute(select(UserTable).filter(UserTable.id == curr_user.id))
        user = result.scalars().first()
        user.first_name = input.first_name
        user.last_name = input.last_name   
        await db.commit()
    return IDReturn(id=strawberry.ID(str(user.id)))


async def edit_interests(self, input: EditInterestsInput, info: strawberry.Info) -> EditInterestsResult:
    tags =  [ tag.value for tag in input.interests ]
    async with get_session() as db:
        user = info.context.user
        result = await db.execute(select(UserProfileTable).filter(UserProfileTable.id == user.id))
        user_profile = result.scalars().first()
        user_profile.tags_list = tags
        await db.commit()
    return IDReturn(id=strawberry.ID(str(user_profile.id)))


async def edit_profile_pic(self, input: EditImageInput, info: strawberry.Info) -> EditProfilePicResult:
    async with get_session() as db:
        user = info.context.user
    img = await app.get_azure_blob_handler().upload_blob(input.image)
    result = await db.execute(select(UserProfileTable).filter(UserProfileTable.id == user.id))
    user_ = result.scalars().first()
    user_.image = img
    await db.commit()
    return IDReturn(id=strawberry.ID(str(user.id)))


async def login_user(self, input: LoginUserInput) -> LoginResult:
    async with get_session() as db:
        result = await db.execute(select(UserTable).filter(UserTable.email == input.email))
        user = result.scalars().first()
    if not user or not verify_password(input.password, user.password):
        return Error(msg="Invalid credentials", code=ErrorType.LOGIN_ERROR)
    user_dict = {c.key: getattr(user, c.key) for c in inspect(UserTable).mapper.column_attrs}
    token = create_access_token(data={"email": user.email, "id": user.id})
    return LoginPayload(user=User.from_pydantic(UserModel.model_validate(user_dict)), token=Token(token=token))


async def delete_user(self, info: strawberry.Info) -> strawberry.ID:
    async with get_session() as db:
        user = info.context.user
        result = await db.execute(select(UserTable).filter(UserTable.id == user.id))
        user_db = result.scalars().first()
        await db.delete(user_db)
        await db.commit()
        deletion_event = {
            "message_type": 1,
            "user_id": user.id
        }
        rabbit = app.get_rabbit_producer()
        await rabbit.send_message(json.dumps(deletion_event))
        return strawberry.ID(str(user.id))

async def change_password(self, input: ChangePasswordInput, info: strawberry.Info) -> ChangePasswordResult:
    async with get_session() as db:
        user = info.context.user
        result = await db.execute(select(UserTable).filter(UserTable.email == user.email))
        user = result.scalars().first()
        user_dict = {c.key: getattr(user, c.key) for c in inspect(UserTable).mapper.column_attrs}
        user_model = UserModel.model_validate(user_dict) 
        if not verify_password(input.old_password, user_model.password):
            return Error(msg="Invalid old password", code=ErrorType.INVALID_PASSWORD)
        setattr(user, "password", hash_password(input.new_password))
        await db.commit()
    return IDReturn(id=strawberry.ID(str(user_model.id)))


async def request_password_reset(self, input: RequestPasswordResetInput, info: strawberry.Info) -> ResetRequestResult:
    async with get_session() as db:
        result = await db.execute(select(UserTable).filter(UserTable.email == input.email))
        user = result.scalars().first()
        if user is None:
            return Error(msg="Email not registered", code=ErrorType.RESET_REQUEST_FAIL)
        token = generate_token()
        expiration = datetime.now() + timedelta(minutes=10)
        info.context.background_tasks.add_task(send_email, input.email, token)
        email_token = EmailToken(user_id=user.id, token=token, expiration=expiration)
        await db.merge(email_token)
        await db.commit()
    return IDReturn(id=strawberry.ID(str(user.id)))


async def password_reset(self, input: PasswordResetInput) -> PasswordResetResult:
    async with get_session() as db:
        email_result = await db.execute(select(EmailToken).filter(EmailToken.token == input.email_token))
        email_result = email_result.scalars().first()
        if email_result is None:
            return Error(msg="Invalid or expired token", code=ErrorType.RESET_FAIL)
        token_dict = {c.key: getattr(email_result, c.key) for c in inspect(EmailToken).mapper.column_attrs}
        email_token = EmailTokenModel.model_validate(token_dict)
        print(email_token.expiration.replace(tzinfo=timezone.utc))
        print(datetime.now(timezone.utc))
        if email_token.expiration.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            return Error(msg="Invalid or expired token", code=ErrorType.RESET_FAIL)

        result = await db.execute(select(UserTable).filter(UserTable.id == email_token.user_id))
        user_db = result.scalars().first()
        if user_db is None:
            return Error(msg="User not found", code=ErrorType.RESET_FAIL)

        await db.delete(email_result)
        setattr(user_db, "password", hash_password(input.new_password))
        await db.commit()
    return IDReturn(id=strawberry.ID(str(email_token.user_id)))


async def me(self, info: strawberry.Info) -> User:
    token_data = info.context.user
    async with get_session() as db:
        user_db = await db.get(UserTable, token_data.id)
        user_dict = {c.key: getattr(user_db, c.key) for c in inspect(UserTable).mapper.column_attrs}
        return User.from_pydantic(UserModel.model_validate(user_dict))

async def user(self, id: int) -> User | None:
    async with get_session() as db:
        user_db = await db.get(UserTable, id)
        if user is None:
            return None
        user_dict = {c.key: getattr(user_db, c.key) for c in inspect(UserTable).mapper.column_attrs}
        return User.from_pydantic(UserModel.model_validate(user_dict))
    
async def user_profile(self, info: strawberry.Info) -> UserProfile:
    token_data = info.context.user
    async with get_session() as db:
        user_profile_db = await db.get(UserProfileTable, token_data.id)
        user_db = await db.get(UserTable, token_data.id)
        if (user_profile_db is None):
            user_profile = UserProfileTable(
                bio="",
                interests="",
                id=token_data.id,
                image=""
            )
            db.add(user_profile)
            await db.commit()
        user_dict = {c.key: getattr(user_db, c.key) for c in inspect(UserTable).mapper.column_attrs}
        user_profile_db = await db.get(UserProfileTable, token_data.id)
        img_blob = await app.get_azure_blob_handler().get_blob(user_profile_db.image) # type: ignore
        return UserProfile(
            user=User.from_pydantic(UserModel.model_validate(user_dict)),
            bio=user_profile_db.bio,
            interests=user_profile_db.tags_list,
            # get image from blob storage
            image=img_blob
        )


@strawberry.type
class Mutation:
    create_user: CreateUserResult = strawberry.field(resolver=create_user)
    login: LoginResult = strawberry.field(resolver=login_user)
    change_password: ChangePasswordResult = strawberry.field(resolver=change_password, permission_classes=[IsAuthenticated])
    request_password_reset: ResetRequestResult = strawberry.field(resolver=request_password_reset)
    password_reset: PasswordResetResult = strawberry.field(resolver=password_reset)
    delete_user: strawberry.ID = strawberry.field(resolver=delete_user, permission_classes=[IsAuthenticated])
    edit_bio: EditBioResult = strawberry.field(resolver=edit_bio, permission_classes=[IsAuthenticated])
    edit_interests: EditInterestsResult = strawberry.field(resolver=edit_interests, permission_classes=[IsAuthenticated])
    edit_profile_pic: EditProfilePicResult = strawberry.field(resolver=edit_profile_pic, permission_classes=[IsAuthenticated])
    user_profile: UserProfile = strawberry.field(resolver=user_profile, permission_classes=[IsAuthenticated])
    edit_name: EditNameResult = strawberry.field(resolver=edit_name, permission_classes=[IsAuthenticated])

@strawberry.type
class Query:
    user: User | None = strawberry.field(resolver=user, permission_classes=[IsAuthenticated])
    me: User = strawberry.field(resolver=me, permission_classes=[IsAuthenticated])

schema = strawberry.Schema(query=Query, mutation=Mutation)
