from shared.rabbitmq.rabbit_consumer import RabbitConsumer
from aio_pika.abc import AbstractIncomingMessage
from models import get_session, UserEventTable, EventTable
import json
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import datetime

async def process_delete_user(payload: dict):
    async with get_session() as db:
        async with db.begin():
            result = await db.execute(select(UserEventTable)
                .filter(UserEventTable.user_id == payload['user_id']))
            user_events = result.scalars().all()
            if user_events:
                for user_event in user_events:
                    await db.delete(user_event)

            await db.commit()
    return True

async def process_delete_event(payload: dict):
    async with get_session() as db:
        async with db.begin():
            result = await db.execute(select(UserEventTable)
                .filter(UserEventTable.event_id == payload['event_id']))
            user_events = result.scalars().all()

            if user_events:
                for user_event in user_events:
                    await db.delete(user_event)                    

            result = await db.execute(select(EventTable)
                .filter(EventTable.id == payload['event_id']))
            events = result.scalars().all()

            if events:
                for event in events:
                    await db.delete(event)

            await db.commit()
    return True

async def process_edit_event(payload: dict):
    async with get_session() as db:
        async with db.begin():
            result = await db.execute(select(EventTable)
                .filter(EventTable.id == payload['event_id']))
            event = result.scalars().first()
            if event:
                event.name = payload['name']
                event.description = payload['description']
                event.location = payload['location']
                event.tags = payload['tags']
                event.created_by = payload['created_by']
                event.datetime = datetime.fromisoformat(payload['datetime'])

            await db.commit()
    return True