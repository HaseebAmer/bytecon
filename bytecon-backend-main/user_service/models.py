from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import logging
import asyncio
from api.schema import Tags
import json

Base = declarative_base()
logger = logging.getLogger()

DATABASE_URL = "sqlite+aiosqlite:///./database.db"

class UserTable(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    password = Column(String, nullable=False)

    email_tokens = relationship("EmailToken", back_populates="user")

class UserProfileTable(Base):
    __tablename__ = "user_profiles"
    bio = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)
    id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True, nullable=False)
    image = Column(Text, nullable=True)
    #user = relationship("UserTable", back_populates="user_profile", uselist=False)
    @property
    def tags_list(self) -> list[Tags]:
        tags_value = self.__dict__.get('interests')
        if tags_value:
            return [ Tags(tag) for tag in json.loads(tags_value)]
        return []  

    @tags_list.setter
    def tags_list(self, value):
        self.interests = json.dumps(value)   

class EmailToken(Base):
    __tablename__ = 'email_token'
    
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True, nullable=True)
    token = Column(Text, nullable=False)
    expiration = Column(DateTime, nullable=False)
    
    user = relationship("UserTable", back_populates="email_tokens", uselist=False)


engine = create_async_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

async_session = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def migrate_tables() -> None:
    logger.info("Starting to migrate")

    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Done migrating")

if __name__ == "__main__":
    asyncio.run(migrate_tables())

@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session: # type: ignore
        async with session.begin():
            try:
                yield session
            except Exception as e:
                # Handle any exceptions raised during session operations
                logging.error(f"Error in session operation: {e}")
                raise
            finally:
                await session.close()