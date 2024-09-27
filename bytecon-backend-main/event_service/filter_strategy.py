from abc import ABC, abstractmethod
import asyncio
import base64
from datetime import datetime
import json

from pydantic import BaseModel
from sqlalchemy import inspect, select
from typing import Sequence
from api.schema import DateFilter, DatetimeCursor, Error, ErrorType, Event, EventConnection, EventEdge, EventPyModel, FilterType, GetEventsResult, PageInfo, RelevanceFilter, SearchCursor, SearchFilter, TagsCursor
import utils
from models import EventTable, get_session
import app

class FilterStrategy(ABC):
    @abstractmethod
    async def execute_query(self, filter: FilterType | None, first: int | None, after: str | None) -> GetEventsResult:
        pass

    async def get_images(self, events: Sequence[EventTable]) -> list[str]:
        get_image_tasks = [app.get_azure_blob_handler().get_blob(getattr(event, "image")) for event in events]
        return await asyncio.gather(*get_image_tasks)

class SearchFilterStrategy(FilterStrategy):

    async def execute_query(self, filter: FilterType , first: int | None, after: str | None) -> GetEventsResult:
        search_filter = filter.search_filter
        search_cursor = None
        if after is not None:
            try:
                search_cursor = SearchCursor(**json.loads(base64.b64decode(after)))
            except Exception:
                return Error(msg="Invalid cursor provided", code=ErrorType.BAD_REQUEST)

        async with get_session() as db: 
            stmt = select(EventTable).where(EventTable.datetime > datetime.now()).order_by(EventTable.datetime, EventTable.id)
            result = await db.execute(stmt)
            events = result.scalars().all()

            events_with_distance = []
            for event in events:
                distance = utils.edit_distance(str(getattr(event, "name")), search_filter.search) # type: ignore
                if search_cursor is not None and (distance > search_cursor.relevance or 
                                      search_cursor.relevance == distance and search_cursor.id < getattr(event, "id")):
                    events_with_distance.append((event, distance))
                elif search_cursor is None:
                    events_with_distance.append((event, distance))
            
            events_with_distance.sort(key=lambda x: x[1])
            has_next_page = len(events_with_distance) > first if first else False
            events_with_distance = events_with_distance if first is None else events_with_distance[:first]

            if events_with_distance:
                end_cursor = utils.b64_encode(SearchCursor(id=getattr(events_with_distance[-1][0], "id"), relevance=events_with_distance[-1][1]).model_dump_json())
            else:
                end_cursor = None

            page_info = PageInfo(
                end_cursor = end_cursor,
                has_next_page = has_next_page
            )
            
        event_list = []
        images = await self.get_images([event for event, _ in events_with_distance])
        for index, event_with_distance in enumerate(events_with_distance):
            event, edit_distance = event_with_distance
            event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
            event_dict['tags'], event_dict['image'] = event.tags_list, images[index]
            cursor = utils.b64_encode(SearchCursor(id=getattr(event, "id"), relevance=edit_distance).model_dump_json())
            event_list.append(EventEdge(cursor=cursor, edge=Event.from_pydantic(EventPyModel.model_validate(event_dict))))
        return EventConnection(page_info=page_info, edges=event_list)


class RelevanceFilterStrategy(FilterStrategy):

    async def execute_query(self, filter: FilterType, first: int | None, after: str | None) -> GetEventsResult:
        relevance_filter = filter.relevance_filter
        tags_cursor = None
        if after is not None:
            try:
                tags_cursor = TagsCursor(**json.loads(base64.b64decode(after)))
            except Exception:
                return Error(msg="Invalid cursor provided", code=ErrorType.BAD_REQUEST)
        async with get_session() as db: 
            stmt = select(EventTable).where(EventTable.datetime > datetime.now()).order_by(EventTable.datetime, EventTable.id)
            result = await db.execute(stmt)
            events = result.scalars().all()
            
            events_with_tags = []
            for event in events:
                num_tags = utils.tag_relevance(relevance_filter.tags, event.tags_list) # type: ignore
                if tags_cursor and (tags_cursor.matching_tags > num_tags or 
                                        tags_cursor.matching_tags == num_tags and tags_cursor.id < getattr(event, "id")):
                    events_with_tags.append((event, num_tags))
                elif tags_cursor is None:
                    events_with_tags.append((event, num_tags))
            
            events_with_tags.sort(key=lambda x: x[1], reverse=True)
            has_next_page = len(events_with_tags) > first if first else False
            events_with_tags = events_with_tags if first is None else events_with_tags[:first]

            if events_with_tags:
                end_cursor = utils.b64_encode(TagsCursor(id=getattr(events_with_tags[-1][0], "id"), matching_tags=events_with_tags[-1][1]).model_dump_json())
            else:
                end_cursor = None

            page_info = PageInfo(
            end_cursor = end_cursor,
            has_next_page = has_next_page
            )
        event_list = []
        images = await self.get_images([event for event, _ in events_with_tags])
        for index, event_with_tags in enumerate(events_with_tags):
            event, matching_tags = event_with_tags
            event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
            event_dict['tags'], event_dict['image'] = event.tags_list, images[index]
            cursor = utils.b64_encode(TagsCursor(id=getattr(event, "id"), matching_tags=matching_tags).model_dump_json())
            event_list.append(EventEdge(cursor=cursor, edge=Event.from_pydantic(EventPyModel.model_validate(event_dict))))
        return EventConnection(page_info=page_info, edges=event_list)

class DateFilterStrategy(FilterStrategy):

    async def execute_query(self, filter: FilterType, first: int | None, after: str | None) -> GetEventsResult:
        date_filter = filter.date_filter
        datetime_cursor = None
        if after is not None:
            try:
                datetime_cursor = DatetimeCursor(**json.loads(base64.b64decode(after)))
            except Exception:
                return Error(msg="Invalid cursor provided", code=ErrorType.BAD_REQUEST)
        if date_filter.from_ is None and date_filter.to is None: # type: ignore
            return Error(msg="Invalid filter provided", code=ErrorType.BAD_REQUEST)
        
        async with get_session() as db:
            query = select(EventTable)
            if datetime_cursor:
                from_id = datetime_cursor.id
                from_datetime = datetime_cursor.datetime
            else:
                from_id = 0
                from_datetime = date_filter.from_ # type: ignore

            if from_datetime:
                query = query.where(EventTable.datetime >= from_datetime) # type: ignore
            if date_filter.to: # type: ignore
                query = query.where(EventTable.datetime <= date_filter.to) # type: ignore
            query = query.where(EventTable.id > from_id).order_by(EventTable.datetime, EventTable.id)
            if first:
                query = query.limit(first + 1)
            result = await db.execute(query)
            events = result.scalars().all()
            has_next_page = len(events) == first + 1 if first else False
            if has_next_page:
                events = events[:-1]
            if events:
                end_cursor = utils.b64_encode(DatetimeCursor(id=getattr(events[-1], "id"), datetime=getattr(events[-1], "datetime")).model_dump_json())
            else:
                end_cursor = None

            page_info = PageInfo(
                end_cursor=end_cursor,
                has_next_page=has_next_page
            )
            event_list = []
            images = await self.get_images(events)
            for index, event in enumerate(events):
                event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
                event_dict['tags'], event_dict['image'] = event.tags_list, images[index]
                cursor = utils.b64_encode(DatetimeCursor(id=getattr(event, "id"), datetime=getattr(event, "datetime")).model_dump_json())
                event_list.append(EventEdge(cursor=cursor, edge=Event.from_pydantic(EventPyModel.model_validate(event_dict))))
            
            return EventConnection(page_info=page_info, edges=event_list)
        
class NoFilterStrategy(FilterStrategy):

    async def execute_query(self, filter: None, first: int | None, after: str | None) -> GetEventsResult:
        datetime_cursor = None
        if after is not None:
            try:
                datetime_cursor = DatetimeCursor(**json.loads(base64.b64decode(after)))
            except Exception:
                return Error(msg="Invalid cursor provided", code=ErrorType.BAD_REQUEST)
            
        async with get_session() as db:
            query = select(EventTable)
            if datetime_cursor:
                query = query.where(EventTable.id > datetime_cursor.id).where(EventTable.datetime >= datetime_cursor.datetime)
            query = query.order_by(EventTable.datetime, EventTable.id)
            if first:
                query = query.limit(first + 1)

            result = await db.execute(query)
            events = result.scalars().all()
            has_next_page = len(events) == first + 1 if first else False
            if has_next_page:
                events = events[:-1]
            if events:
                end_cursor = utils.b64_encode(DatetimeCursor(id=getattr(events[-1], "id"), datetime=getattr(events[-1], "datetime")).model_dump_json())
            else:
                end_cursor = None

            page_info = PageInfo(
                end_cursor=end_cursor,
                has_next_page=has_next_page
            )
            images = await self.get_images(events)
            event_list = []
            for index, event in enumerate(events):
                event_dict = {c.key: getattr(event, c.key) for c in inspect(EventTable).mapper.column_attrs}
                event_dict['tags'], event_dict['image'] = event.tags_list, images[index]
                cursor = utils.b64_encode(DatetimeCursor(id=getattr(event, "id"), datetime=getattr(event, "datetime")).model_dump_json())
                event_list.append(EventEdge(cursor=cursor, edge=Event.from_pydantic(EventPyModel.model_validate(event_dict))))
            
            return EventConnection(page_info=page_info, edges=event_list)