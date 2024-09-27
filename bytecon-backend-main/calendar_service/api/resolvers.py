from sqlalchemy import inspect
import strawberry
from models import get_session
from models import EventTable, UserEventTable
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from sqlalchemy import extract
from api.schema import Event, EventPyModel, addToCalendarResult, removeFromCalendarResult, GetCalendarInput, GetCalendarResult, EventInput, Success, Error, ErrorType, IsAuthenticated
import base64
from datetime import datetime
from models import engine


async def add_to_calendar(self, input: EventInput, info: strawberry.Info) -> addToCalendarResult:
    async with get_session() as db:
        async with db.begin():
            # Check if the event exists
            result = await db.execute(select(EventTable).filter(EventTable.id == input.event_id))
            existing_event = result.scalars().first()

            if not existing_event:
                # If event does not exist, create it
                tags = [tag.value for tag in input.tags]
                event = EventTable(
                    id=input.event_id,
                    description=input.description,
                    name=input.name,
                    location=input.location,
                    tags_list=tags,
                    created_by=info.context.user.id,
                    datetime=input.datetime
                )
                db.add(event)

            # Check if the user to event relationship exists
            user_id_context = info.context.user.id
            result = await db.execute(select(UserEventTable).filter(UserEventTable.event_id == input.event_id).filter(UserEventTable.user_id == user_id_context))
            existing_user_to_event = result.scalars().first()

            if not existing_user_to_event:
                # If user to event relationship does not exist, create it
                user_event = UserEventTable(
                    event_id=input.event_id,
                    user_id=user_id_context
                )
                db.add(user_event)

            await db.commit()
    
    return Success(success=True)

async def remove_from_calendar(self, id: int, info: strawberry.Info) -> removeFromCalendarResult:
    async with get_session() as db:
        async with db.begin():
            user_id_context = info.context.user.id
            result = await db.execute(select(UserEventTable)
                .filter(UserEventTable.event_id == id)
                .filter(UserEventTable.user_id == user_id_context))
            user_events = result.scalars().all()
            print("remove from calendar ", user_events)
            for user_event in user_events:
                await db.delete(user_event)

            await db.commit()
    return Success(success=True)

async def get_calendar(self, input: GetCalendarInput, info: strawberry.Info) -> GetCalendarResult:
    print(input.datetime)
    datetime_ = input.datetime
    datetime_obj = datetime.fromisoformat(str(datetime_))
    month = datetime_obj.month
    year = datetime_obj.year
    user = info.context.user
    eventListReturn = []
    async with get_session() as db:
        result = await db.execute(select(UserEventTable).filter(user.id == UserEventTable.user_id))
        events = [user_event.event_id for user_event in result.scalars()]
  
        filtered_events = await db.execute(
            select(EventTable)
            .filter(EventTable.id.in_(events))
            .filter(extract('month', EventTable.datetime) == month)
            .filter(extract('year', EventTable.datetime) == year)
        )
        eventList = filtered_events.scalars().all()
        print("add to calendar ", eventList)

        event_dicts = []

        for event in eventList:
            event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
            event_dict['tags'] = event.tags_list
            event_dicts.append(event_dict)

        for event in event_dicts:
            eventListReturn.append(Event.from_pydantic(EventPyModel.model_validate(event)))

    return GetCalendarResult(calendar=eventListReturn)

@strawberry.type
class Mutation:
    add_to_calendar: addToCalendarResult = strawberry.field(resolver=add_to_calendar, permission_classes=[IsAuthenticated])
    remove_from_calendar: removeFromCalendarResult = strawberry.field(resolver=remove_from_calendar, permission_classes=[IsAuthenticated])

@strawberry.type
class Query:
    get_calendar: GetCalendarResult = strawberry.field(resolver=get_calendar, permission_classes=[IsAuthenticated])

schema = strawberry.Schema(query=Query, mutation=Mutation)