from sqlalchemy import inspect, select, update
import json
import strawberry
from filter_strategy import NoFilterStrategy, SearchFilterStrategy, RelevanceFilterStrategy, DateFilterStrategy
from models import get_session
from models import EventTable
from api.schema import CreateEventResult, Cursor, DateFilter, EditEvent, EditEventResult, ErrorType, Event, EventConnection, DeleteEventResult, EventEdge, EventInput, EventPyModel, FilterType, GetEventInput, GetEventsResult, GetSingleEventResult, IsAuthenticated, PageInfo, Error, RelevanceFilter, SearchFilter, Success
import base64
import app
import utils 
import asyncio

async def create_event(self, input: EventInput, info: strawberry.Info) -> CreateEventResult:
    tags =  [ tag.value for tag in input.tags ]
    async with get_session() as db:
        result = await db.execute(select(EventTable).where(EventTable.name == input.name).where(EventTable.datetime == input.datetime))
        result = result.scalars().first()
        if result:
            return Error(msg= f"Event with name {input.name} exists", code=ErrorType.EVENT_EXISTS)
        image_hash = await app.get_azure_blob_handler().upload_blob(input.image) 
        event = EventTable(
            description=input.description,
            name=input.name,
            location=input.location,
            tags_list=tags,
            created_by=info.context.user.id,
            datetime=input.datetime,
            image=image_hash
        )
        db.add(event)
        await db.commit()
        event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
        event_dict['tags'], event_dict['image']  = event.tags_list, input.image
        return Event.from_pydantic(EventPyModel.model_validate(event_dict))

async def my_events(first: int | None, after: str | None, info: strawberry.Info) -> GetEventsResult:
    user_id = info.context.user.id
    async with get_session() as db:
        after_id = 0
        if after:
            cursor_dict = json.loads(base64.b64decode(after))
            try:
                cursor_type = Cursor(**cursor_dict)
                after_id = cursor_type.id
            except Exception as _:
                return Error(msg="Invalid request input provided", code=ErrorType.BAD_REQUEST)
        
        query = (
            select(EventTable)
            .filter(EventTable.created_by == int(user_id))
            .filter(EventTable.id > after_id)
            .order_by(EventTable.id)
        )

        if first is not None:
            query = query.limit(first + 1)

        result = await db.execute(query)
        events = result.scalars().all()
        has_next_page = len(events) == first + 1 if first else False
        if has_next_page:
            events = events[:-1]
        if events:
            end_cursor = utils.b64_encode(Cursor(id=getattr(events[-1], "id")).model_dump_json())
        else:
            end_cursor = None
        
        page_info = PageInfo(
            end_cursor = end_cursor,
            has_next_page = has_next_page
        )
        get_image_tasks = [app.get_azure_blob_handler().get_blob(getattr(event, "image")) for event in events]
        images = await asyncio.gather(*get_image_tasks)
        event_list = []
        for index, event in enumerate(events):
            event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
            event_dict['tags'], event_dict['image'] = event.tags_list, images[index]
            cursor = utils.b64_encode(Cursor(id=getattr(event, "id")).model_dump_json())
            event_list.append(EventEdge(cursor=cursor, edge=Event.from_pydantic(EventPyModel.model_validate(event_dict))))
        return EventConnection(page_info=page_info, edges=event_list)

async def get_events(input: GetEventInput) -> GetEventsResult:
    filter = input.filter
    if filter:
        if filter.search_filter:
            strategy = SearchFilterStrategy()
        elif filter.relevance_filter:
            strategy = RelevanceFilterStrategy()
        elif filter.date_filter:
            strategy = DateFilterStrategy()
    else:
        strategy = NoFilterStrategy()
    if input.first is not None and input.first == 0:
        return Error(msg="Invalid query parameter for first provided", code=ErrorType.BAD_REQUEST)
    return await strategy.execute_query(filter, input.first, input.after) # type: ignore

async def delete_event(id: int, info: strawberry.Info) -> DeleteEventResult:
    user = info.context.user
    async with get_session() as db:
        result = await db.execute(select(EventTable).where(EventTable.id == id))
        result = result.scalars().first()
        if result is None:
            return Error(msg="This event does not exist", code=ErrorType.EVENT_NOT_FOUND)
        if getattr(result, "created_by") != user.id:
            return Error(msg="User does not have permission for this action", code=ErrorType.PERMISSION_ERROR)
        await db.delete(result)
        await db.commit()
    deletion_event = {
        "message_type": 3,
        "event_id": id
    }
    rabbit = app.get_rabbit_producer()
    await rabbit.send_message(json.dumps(deletion_event))
    return Success(success=True)

async def edit_event(input: EditEvent, info: strawberry.Info) -> EditEventResult:
    user = info.context.user
    edit_model = input.to_pydantic()
    async with get_session() as db:
        result = await db.execute(select(EventTable).where(EventTable.id == edit_model.id))
        result = result.scalars().first()
        if result is None:
            return Error(msg="This event does not exist", code=ErrorType.EVENT_NOT_FOUND)
        if getattr(result, "created_by") != user.id:
            return Error(msg="User does not have permission for this action", code=ErrorType.PERMISSION_ERROR)            
        update_data = edit_model.model_dump(exclude_none=True, exclude={"id", "tags"})
        if edit_model.tags:
            tags = [ tag.value for tag in edit_model.tags ]
            update_data['tags'] = json.dumps(tags)
        if edit_model.image:
            update_data['image'] = await app.get_azure_blob_handler().upload_blob(edit_model.image)
        if update_data:
            stmt = update(EventTable).where(EventTable.id == edit_model.id).values(**update_data).execution_options(synchronize_session="fetch")
            await db.execute(stmt)
            await db.commit()
        updated_event = await db.execute(select(EventTable).where(EventTable.id == edit_model.id))
        updated_event = updated_event.scalars().one()
        event_dict = {c.key: getattr(updated_event, c.key) for c in inspect(EventTable).mapper.column_attrs}
        event_dict['tags'] = updated_event.tags_list
        event_model = EventPyModel.model_validate(event_dict)
    edit_event_msg = {
        "message_type": 2,
        "event_id": event_model.id,
        "name": event_model.name,
        "description": event_model.description,
        "location": event_model.location,
        "tags": json.dumps([tag.value for tag in event_model.tags]),
        "created_by": user.id,
        "datetime": event_model.datetime.isoformat()
    }
    rabbit = app.get_rabbit_producer()
    await rabbit.send_message(json.dumps(edit_event_msg))
    return Event.from_pydantic(event_model)

async def get_event_by_id(id: int) -> GetSingleEventResult:
    async with get_session() as db:
        event = await db.execute(select(EventTable).where(EventTable.id == id))
        event = event.scalars().first()
        if event is None:
            return Error(msg="Event not found", code=ErrorType.EVENT_NOT_FOUND)
        event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
        event_dict['tags'] = event.tags_list
        event_dict['image'] = await app.get_azure_blob_handler().get_blob(event_dict['image'])
        return Event.from_pydantic(EventPyModel.model_validate(event_dict))

@strawberry.type
class Mutation:
    create_event: CreateEventResult = strawberry.field(resolver=create_event, permission_classes=[IsAuthenticated])
    delete_event: DeleteEventResult = strawberry.field(resolver=delete_event, permission_classes=[IsAuthenticated])
    edit_event: EditEventResult = strawberry.field(resolver=edit_event, permission_classes=[IsAuthenticated])

@strawberry.type
class Query:
    get_events: GetEventsResult = strawberry.field(resolver=get_events, permission_classes=[IsAuthenticated])
    my_events: GetEventsResult = strawberry.field(resolver=my_events, permission_classes=[IsAuthenticated])
    get_event_by_id: GetSingleEventResult = strawberry.field(resolver=get_event_by_id, permission_classes=[IsAuthenticated])

schema = strawberry.Schema(query=Query, mutation=Mutation)