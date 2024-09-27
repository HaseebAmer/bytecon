from contextlib import asynccontextmanager
import json
from typing import AsyncGenerator

from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import logging
import asyncio

from api.schema import Tags

Base = declarative_base()
logger = logging.getLogger()

DATABASE_URL = "sqlite+aiosqlite:///./database.db"

class EventTable(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    name = Column(String, nullable=False)
    tags = Column(Text, nullable=False)
    created_by = Column(Integer, nullable=True)
    datetime = Column(DateTime, nullable=False, index=True)
    image = Column(String, nullable=True)

    @property
    def tags_list(self) -> list[Tags]:
        tags_value = self.__dict__.get('tags')
        if tags_value:
            tags_list = json.loads(tags_value)
            return [Tags(tag) for tag in tags_list]
        return []

    @tags_list.setter
    def tags_list(self, value):
        self.tags = json.dumps(value)


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
    async with async_session() as session:
        try:
            yield session
        except Exception as e:
            logging.error(f"Error in session operation: {e}")
            raise
        finally:
            await session.close()
