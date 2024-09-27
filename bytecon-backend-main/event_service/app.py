from contextlib import asynccontextmanager
from functools import cached_property

from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter, BaseContext
from api.schema import TokenData
from oauth2 import verify_access_token
from api.resolvers import schema
from shared.azure.access_azure_storage import AzureBlobHandler
from shared.rabbitmq import rabbit_provider
from fastapi.middleware.cors import CORSMiddleware

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

azure_blob_handler = AzureBlobHandler("shared/azure/images/default-event.jpg")

def get_azure_blob_handler():
    return azure_blob_handler


graphql_app = GraphQLRouter(schema, context_getter=get_context)

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

# Configure CORS
origins = [
    "http://127.0.0.1:3000",
    "http://localhost", 
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")