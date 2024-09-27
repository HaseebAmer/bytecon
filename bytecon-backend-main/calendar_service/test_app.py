import pytest
from datetime import datetime
from api.schema import Tags  # Import your Tags enum from the correct module

@pytest.mark.asyncio
async def test_add_to_calendar(client, create_event):
    event_input = {
        "eventId": 1,
        "name": "Calendar Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Event Location",
        "description": "Event Description",
        "datetime": "2024-08-02T12:00:00",
        "createdBy": 1
    }
    mutation_add_to_calendar = f'''
        mutation {{
            addToCalendar(input: {{
                eventId: {event_input["eventId"]},
                name: "{event_input["name"]}",
                tags: {event_input["tags"]},
                location: "{event_input["location"]}",
                description: "{event_input["description"]}",
                datetime: "{event_input["datetime"]}",
                createdBy: {event_input["createdBy"]},
            }}) {{
                ... on Success {{
                    success
                }}
                ... on Error {{
                    msg
                    code
                }}
            }}
        }}
    '''
    headers = create_event("calendaruser@example.com", event_input)[1]
    response = client.post("/graphql", json={"query": mutation_add_to_calendar}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["addToCalendar"]["success"] == True

@pytest.mark.asyncio
async def test_remove_from_calendar(client, create_event):
    event_input = {
        "eventId": 1,
        "name": "Calendar Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Event Location",
        "description": "Event Description",
        "datetime": "2024-08-02T12:00:00",
        "createdBy": 1
    }
    # Add event to calendar first
    headers = create_event("calendaruser@example.com", event_input)[1]
    mutation_add_to_calendar = f'''
        mutation {{
            addToCalendar(input: {{
                eventId: {event_input["eventId"]},
                name: "{event_input["name"]}",
                tags: {event_input["tags"]},
                location: "{event_input["location"]}",
                description: "{event_input["description"]}",
                datetime: "{event_input["datetime"]}",
                createdBy: {event_input["createdBy"]}
            }}) {{
                ... on Success {{
                    success
                }}
                ... on Error {{
                    msg
                    code
                }}
            }}
        }}
    '''
    client.post("/graphql", json={"query": mutation_add_to_calendar}, headers=headers)

    # Remove event from calendar
    mutation_remove_from_calendar = f'''
        mutation {{
            removeFromCalendar(id: {event_input["eventId"]}) {{
                ... on Success {{
                    success
                }}
                ... on Error {{
                    msg
                    code
                }}
            }}
        }}
    '''
    response = client.post("/graphql", json={"query": mutation_remove_from_calendar}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["removeFromCalendar"]["success"] == True

@pytest.mark.asyncio
async def test_get_calendar(client, create_event, get_calendar_qry):
    event_inputs = [
        {
            "eventId": i,
            "name": f"Calendar Event {i}",
            "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
            "location": f"Event Location {i}",
            "description": f"Event Description {i}",
            "datetime": "2024-08-02T12:00:00",
            "createdBy": 1
        }
        for i in range(10)
    ]

    headers = create_event("calendaruser@example.com", event_inputs[0])[1]

    for event_input in event_inputs:
        mutation_add_to_calendar = f'''
            mutation {{
                addToCalendar(input: {{
                    eventId: {event_input["eventId"]},
                    name: "{event_input["name"]}",
                    tags: {event_input["tags"]},
                    location: "{event_input["location"]}",
                    description: "{event_input["description"]}",
                    datetime: "{event_input["datetime"]}",
                    createdBy: {event_input["createdBy"]}
                }}) {{
                    ... on Success {{
                        success
                    }}
                    ... on Error {{
                        msg
                        code
                    }}
                }}
            }}
        '''
        client.post("/graphql", json={"query": mutation_add_to_calendar}, headers=headers)

    response = client.post("/graphql", json={"query": get_calendar_qry("2024-08-02T12:00:00")}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert len(data["data"]["getCalendar"]["calendar"]) == 10
    for i, event in enumerate(data["data"]["getCalendar"]["calendar"]):
        assert event["name"] == event_inputs[i]["name"]
        assert set(event["tags"]) == set(event_inputs[i]["tags"].strip('[]').split(', '))
        assert event["location"] == event_inputs[i]["location"]
        assert event["description"] == event_inputs[i]["description"]
        assert event["datetime"] == event_inputs[i]["datetime"]
        assert event["createdBy"] == event_inputs[i]["createdBy"]

    # # should be no results for another yyyy-mm
    response = client.post("/graphql", json={"query": get_calendar_qry("2024-09-02T12:00:00")}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert len(data["data"]["getCalendar"]["calendar"]) == 0

    # and the same results for same yyyy-mm but different day
    response = client.post("/graphql", json={"query": get_calendar_qry("2024-08-22T12:00:00")}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert len(data["data"]["getCalendar"]["calendar"]) == 10