import asyncio
import json
import os
import threading
from aio_pika import connect_robust
from aiormq import AMQPConnectionError
from aio_pika.abc import AbstractIncomingMessage
from abc import abstractmethod

class RabbitConsumer:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(RabbitConsumer, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialised'):
            self.connection = None
            self.channel = None
            self.queue = None
            self.initialised = True

    async def connect(self) -> None:
        rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
        connection_attempts = 5
        for attempt in range(connection_attempts):
            try:
                self.connection = await connect_robust(rabbitmq_url)
                break
            except AMQPConnectionError as e:
                if attempt < connection_attempts - 1:
                    print(f"Connection attempt {attempt + 1} failed, retrying in {5} seconds...")
                    await asyncio.sleep(5)
                else:
                    print("All connection attempts failed")
                    raise e
        if self.connection:
            self.channel = await self.connection.channel()
            self.queue = await self.channel.declare_queue("db-synchronise")

    async def on_message(self, message: AbstractIncomingMessage) -> None:
        payload_json = json.loads(message.body.decode('utf-8')) 
        success = await self.process_message(payload_json)
        if success:
            await message.ack()
        
    @abstractmethod
    async def process_message(self, payload: dict) -> bool:
        pass

    async def consume_message(self) -> None:
        if self.channel and self.queue:
            await self.queue.consume(callback=self.on_message)
        await asyncio.Future()

    async def close(self):
        if self.connection:
            await self.connection.close()


# Usage Example:
# Instantiate the class and implement the callback to handle an event
# Choose a better class name than the one below please
# class MyRabbitConsumer(RabbitConsumer):

    # return type will be true if the message from the queue was successfully processed
    # process_message provided a function parameter of dict which can easily be converted into one of the event types with pydantic
    # refer to event_types file        
    # async def process_message(self, payload: dict) -> bool:
    #     function logic....
    #   
            
# Add the following in app.py

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     consumer = MyRabbitConsumer()
#     await consumer.connect()
#     task = asyncio.create_task(consumer.consume_message())
#     try:
#         yield
#     finally:
#         await consumer.close()
#         task.cancel()

