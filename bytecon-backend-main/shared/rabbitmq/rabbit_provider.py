import asyncio
from enum import Enum
import os
from aio_pika import connect, Message, connect_robust
from aiormq import AMQPConnectionError


class RabbitProducer:

    def __init__(self):
        self.connection = None
        self.channel = None
        self.queue = None

    async def connect(self):
        rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
        connection_attempts = 5
        for attempt in range(5):
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

    async def send_message(self, message: str):
        if self.channel and self.queue:
            await self.channel.default_exchange.publish(
                Message(message.encode('utf-8')),
                routing_key=self.queue.name,
            )

    async def close(self):
        if self.connection:
            await self.connection.close()
    