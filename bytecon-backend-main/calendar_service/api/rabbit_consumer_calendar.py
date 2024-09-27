from shared.rabbitmq.rabbit_consumer import RabbitConsumer
from aio_pika.abc import AbstractIncomingMessage
from models import get_session, UserEventTable, EventTable
import json
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import datetime
from api.api_utils import process_delete_user, process_delete_event, process_edit_event
from shared.rabbitmq.event_types import MessageType

class RabbitConsumerCalendar(RabbitConsumer):
    async def process_message(self, payload: dict) -> bool:
        # delete user
        if (payload['message_type'] == 1):
            await process_delete_user(payload)
        # edit event
        elif (payload['message_type'] == 2):
            await process_edit_event(payload)
        # delete event
        elif (payload['message_type'] == 3):
            await process_delete_event(payload)

        return True