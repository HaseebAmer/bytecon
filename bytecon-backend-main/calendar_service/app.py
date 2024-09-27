from functools import cached_property

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from strawberry.fastapi import GraphQLRouter, BaseContext
from contextlib import asynccontextmanager
from oauth2 import verify_access_token
from api.schema import TokenData
from api.resolvers import schema
from api.rabbit_consumer_calendar import RabbitConsumerCalendar
from shared.rabbitmq.rabbit_consumer import RabbitConsumer
class Context(BaseContext):
    @cached_property 
    def user(self) -> TokenData | None:
        if not self.request:
            return None
        
        authorization = self.request.headers.get("Authorization", None)
        if authorization is None:
            return None
        return verify_access_token(authorization)

def get_context() -> Context:
    return Context()

graphql_app = GraphQLRouter(schema, context_getter=get_context)

@asynccontextmanager
async def lifespan(app: FastAPI):
    consumer = RabbitConsumerCalendar()
    await consumer.connect()
    task = asyncio.create_task(consumer.consume_message())
    try:
        yield
    finally:
        await consumer.close()
        task.cancel()


app = FastAPI(lifespan=lifespan)

# Configure CORS
origins = [
    "http://127.0.0.1:3000",
    "http://localhost",  # Add your frontend URL here
    "http://localhost:3000",  # Add this if you are using a frontend running on port 3000
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")
