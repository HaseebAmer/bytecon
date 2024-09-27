import pytest


@pytest.mark.asyncio
async def test_create_event(client, create_event):
    event_input = {
        "name": "Test Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Test Location",
        "description": "Test Description",
        "datetime": "2024-08-02T12:00:00",
        "image": "testimage.jpg"
    }
    data, headers = create_event("eventcreator@example.com", event_input)
    assert data["data"]["createEvent"]["name"] == event_input["name"]
    print(data["data"]["createEvent"]["tags"])
    assert set(data["data"]["createEvent"]["tags"]) == {'ARTIFICIAL_INTELLIGENCE', 'WEB_APPS'}
    assert data["data"]["createEvent"]["location"] == event_input["location"]
    assert data["data"]["createEvent"]["description"] == event_input["description"]
    assert data["data"]["createEvent"]["datetime"] == event_input["datetime"]
    assert data["data"]["createEvent"]["image"] == event_input["image"]

@pytest.mark.asyncio
async def test_create_duplicate(client, create_event):
    event_input = {
        "name": "Test Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Test Location",
        "description": "Test Description",
        "datetime": "2024-08-02T12:00:00",
        "image": "testimage.jpg"
    }
    data, headers = create_event("eventcreator@example.com", event_input)
    data, headers = create_event("eventcreator@example.com", event_input)

    assert data["data"] == {'createEvent': {'code': 'EVENT_EXISTS', 'msg': 'Event with name Test Event exists'}}

@pytest.mark.asyncio
async def test_edit_event(client, create_event):
    event_input = {
        "name": "Test Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Test Location",
        "description": "Test Description",
        "datetime": "2024-08-02T12:00:00",
        "image": "testimage.jpg"
    }
    data, headers = create_event("editevent@example.com", event_input)
    event_id = data["data"]["createEvent"]["id"]

    mutation_edit_event = f'''
        mutation {{
            editEvent(input: {{
                id: {event_id},
                name: "Updated Event",
                tags: [CRYPTOGRAPHY],
                location: "Updated Location",
                description: "Updated Description",
                datetime: "2024-08-03T15:00:00",
                image: "updatedimage.jpg"
            }}) {{
                ... on Event {{
                    id
                    name
                    tags
                    location
                    description
                    datetime
                    image
                }}
                ... on Error {{
                    msg
                    code
                }}
            }}
        }}
    '''
    response = client.post("/graphql", json={"query": mutation_edit_event}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["editEvent"]["name"] == "Updated Event"
    assert set(data["data"]["editEvent"]["tags"]) == {'CRYPTOGRAPHY'}
    assert data["data"]["editEvent"]["location"] == "Updated Location"
    assert data["data"]["editEvent"]["description"] == "Updated Description"
    assert data["data"]["editEvent"]["datetime"] == "2024-08-03T15:00:00"
    assert data["data"]["editEvent"]["image"] is not None


@pytest.mark.asyncio
async def test_delete_event(client, create_event):
    event_input = {
        "name": "Test Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Test Location",
        "description": "Test Description",
        "datetime": "2024-08-02T12:00:00",
        "image": "testimage.jpg"
    }
    data, headers = create_event("deleteevent@example.com", event_input)
    event_id = data["data"]["createEvent"]["id"]

    mutation_delete_event = f'''
        mutation {{
            deleteEvent(id: {event_id}) {{
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
    response = client.post("/graphql", json={"query": mutation_delete_event}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["deleteEvent"]["success"] == True

    # verify event is not there

    query_get_events = '''
        query {
            getEvents(input: {first: 10}) {
                ... on EventConnection {
                    edges {
                        cursor
                        edge {
                            id
                            name
                            tags
                            location
                            description
                            datetime
                            image
                        }
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_get_events}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert len(data["data"]["getEvents"]["edges"]) == 0
    assert data["data"]["getEvents"]["pageInfo"]["hasNextPage"] == False



@pytest.mark.asyncio
async def test_get_events(client, create_event):
    event_inputs = [
        {
            "name": f"Test Event {i}",
            "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
            "location": f"Test Location {i}",
            "description": f"Test Description {i}",
            "datetime": "2024-08-02T12:00:00",
            "image": "testimage.jpg"
        }
        for i in range(10)
    ]

    headers = None

    for event_input in event_inputs:
        _, headers = create_event("getevents@example.com", event_input)

    query_get_events = '''
        query {
            getEvents(input: {first: 10}) {
                ... on EventConnection {
                    edges {
                        cursor
                        edge {
                            id
                            name
                            tags
                            location
                            description
                            datetime
                            image
                        }
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''

    response = client.post("/graphql", json={"query": query_get_events}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert len(data["data"]["getEvents"]["edges"]) == 10
    assert data["data"]["getEvents"]["pageInfo"]["hasNextPage"] == False
    for i, edge in enumerate(data["data"]["getEvents"]["edges"]):
        assert edge["edge"]["name"] == event_inputs[i]["name"]
        assert edge["edge"]["location"] == event_inputs[i]["location"]
        assert edge["edge"]["description"] == event_inputs[i]["description"]
        assert edge["edge"]["datetime"] == event_inputs[i]["datetime"]
        assert edge["edge"]["image"] is not None

@pytest.mark.asyncio
async def test_get_event_by_id(client, create_event):
    event_input = {
        "name": "Test Event",
        "tags": "[SYSTEM_DESIGN, DATABASES]",
        "location": "Test Location",
        "description": "Test Description",
        "datetime": "2024-08-02T12:00:00",
        "image": "testimage.jpg"
    }
    data, headers = create_event("geteventbyid@example.com", event_input)
    event_id = data["data"]["createEvent"]["id"]

    query_get_event_by_id = f'''
        query {{
            getEventById(id: {event_id}) {{
                ... on Event {{
                    id
                    name
                    tags
                    location
                    description
                    datetime
                    image
                }}
                ... on Error {{
                    msg
                    code
                }}
            }}
        }}
    '''
    response = client.post("/graphql", json={"query": query_get_event_by_id}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["getEventById"]["name"] == event_input["name"]
    assert set(data["data"]["getEventById"]["tags"]) == {'SYSTEM_DESIGN', 'DATABASES'}
    assert data["data"]["getEventById"]["location"] == event_input["location"]
    assert data["data"]["getEventById"]["description"] == event_input["description"]
    assert data["data"]["getEventById"]["datetime"] == event_input["datetime"]
    assert data["data"]["getEventById"]["image"] is not None


    # try delete event twice

@pytest.mark.asyncio
async def test_delete_event_repeat(client, create_event):
    event_input = {
        "name": "Test Event",
        "tags": "[ARTIFICIAL_INTELLIGENCE, WEB_APPS]",
        "location": "Test Location",
        "description": "Test Description",
        "datetime": "2024-08-02T12:00:00",
        "image": "testimage.jpg"
    }
    data, headers = create_event("deleteevent@example.com", event_input)
    event_id = data["data"]["createEvent"]["id"]

    mutation_delete_event = f'''
        mutation {{
            deleteEvent(id: {event_id}) {{
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
    response = client.post("/graphql", json={"query": mutation_delete_event}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["deleteEvent"]["success"] == True
    response = client.post("/graphql", json={"query": mutation_delete_event}, headers=headers)
    data = response.json()
    print(data)
    assert data == {'data': {'deleteEvent': {'code': 'EVENT_NOT_FOUND', 'msg': 'This event does not exist'}}}

    # try get event cursor for after

