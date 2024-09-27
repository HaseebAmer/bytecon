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
from models import get_session, Base, UserTable, UserProfileTable, EmailToken


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
def create_user(client):
    def _create_user(email, password, first_name, last_name):
        mutation_create_user = f'''
            mutation {{
                createUser(input: {{
                    email: "{email}",
                    password: "{password}",
                    firstName: "{first_name}",
                    lastName: "{last_name}"
                }}) {{
                    ... on LoginPayload {{
                        token {{
                            token
                        }}
                    }}
                    ... on Error {{
                        msg
                        code
                    }}
                }}
            }}
        '''
        response = client.post("/graphql", json={"query": mutation_create_user})
        data = response.json()
        token = data["data"]["createUser"]["token"]["token"]
        return token
    return _create_user

@pytest.fixture(scope="function")
def auth_headers(create_user):
    def _auth_headers(email, password, first_name, last_name):
        token = create_user(email, password, first_name, last_name)
        return {"Authorization": f"{token}"}
    return _auth_headers
