import asyncio
import json
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, StaticPool
from sqlalchemy.orm import declarative_base, relationship
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from app import app
from models import get_session, Base, EventTable
from api.schema import Tags
from oauth2 import create_access_token


SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./database.db"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

@asynccontextmanager
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_db():
    await create_tables()
    app.dependency_overrides[get_session] = override_get_db

@pytest_asyncio.fixture(scope="function", autouse=True)
async def cleanup_db():
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await create_tables()

@pytest.fixture(scope="function")
def client():
    return TestClient(app)

@pytest.fixture(scope="function")
def auth_headers():
    def _auth_headers(email, id):
        token = create_access_token({"email": email, "id": id})
        print(token)
        return {"Authorization": f"{token}"}
    return _auth_headers

@pytest.fixture(scope="function")
def create_event(client, auth_headers):
    def _create_event(email, event_input):
        headers = auth_headers(email, 1)
        mutation_create_event = f'''
            mutation {{
                createEvent(input: {{
                    name: "{event_input['name']}",
                    tags: {event_input['tags']},
                    location: "{event_input['location']}",
                    description: "{event_input['description']}",
                    datetime: "{event_input['datetime']}",
                    image: "{event_input.get('image', '')}"
                }}) {{
                    ... on Event {{
                        id
                        name
                        tags
                        location
                        description
                        datetime
                        image
                    }}
                    ... on Error {{
                        msg
                        code
                    }}
                }}
            }}
        '''
        response = client.post("/graphql", json={"query": mutation_create_event}, headers=headers)
        return response.json(), headers
    return _create_event
