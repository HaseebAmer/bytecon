from functools import cached_property

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from strawberry.fastapi import GraphQLRouter, BaseContext

from oauth2 import verify_access_token
from api.schema import TokenData
from api.resolvers import schema
from contextlib import asynccontextmanager
from shared.azure.access_azure_storage import AzureBlobHandler
import shared.rabbitmq.rabbit_provider as rabbit_provider

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

azure_blob_handler = AzureBlobHandler("shared/azure/images/default-profile.png")

def get_azure_blob_handler():
    return azure_blob_handler

graphql_app = GraphQLRouter(schema, context_getter=get_context)

# Configure CORS
origins = [
    "http://127.0.0.1:3000",
    "http://localhost",  # Add your frontend URL here
    "http://localhost:3000",  # Add this if you are using a frontend running on port 3000
]

rabbit_producer = rabbit_provider.RabbitProducer()

def get_rabbit_producer() -> rabbit_provider.RabbitProducer:
    return rabbit_producer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to RabbitMQ when application starts
    await rabbit_producer.connect()
    yield
    # Close the RabbitMQ connection when application shuts down
    await rabbit_producer.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")