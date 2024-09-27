import pytest

@pytest.mark.asyncio
async def test_user(client, create_user):
    token = create_user("testuserrr@gmail.com", "securepassword1", "FirstName", "LastName")
    headers = {"Authorization": f"{token}"}
    query_user_profile = '''
        mutation {
            userProfile {
                user {
                    email
                    firstName
                    lastName
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["userProfile"]["user"]["email"] == "testuserrr@gmail.com"
    assert data["data"]["userProfile"]["user"]["firstName"] == "FirstName"
    assert data["data"]["userProfile"]["user"]["lastName"] == "LastName"

@pytest.mark.asyncio
async def test_login_user(client, create_user):
    create_user("loginuser@example.com", "securepassword", "Login", "User")
    mutation_login = '''
        mutation {
            login(input: {
                email: "loginuser@example.com",
                password: "securepassword"
            }) {
                ... on LoginPayload {
                    token {
                        token
                    }
                    user {
                        id
                        email
                    }
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_login})
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["login"]["user"]["email"] == 'loginuser@example.com'
    assert data["data"]["login"]["token"]["token"] is not None

@pytest.mark.asyncio
async def test_login_user_incorrect_password(client, create_user):
    create_user("loginuserwrongpassword@example.com", "securepassword", "Wrong", "Password")
    mutation_login = '''
        mutation {
            login(input: {
                email: "loginuserwrongpassword@example.com",
                password: "wrongpassword"
            }) {
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_login})
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["login"]["msg"] == "Invalid credentials"
    assert data["data"]["login"]["code"] == "LOGIN_ERROR"

@pytest.mark.asyncio
async def test_change_password(client, auth_headers):
    headers = auth_headers("changepassworduser@example.com", "oldpassword", "Change", "Password")
    mutation_change_password = '''
        mutation {
            changePassword(input: {
                oldPassword: "oldpassword",
                newPassword: "newpassword"
            }) {
                ... on IDReturn {
                    id
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_change_password}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["changePassword"]["id"] is not None

@pytest.mark.asyncio
async def test_change_password_invalid(client, auth_headers):
    headers = auth_headers("changepassworduser@example.com", "oldpassword", "Change", "Password")
    mutation_change_password = '''
        mutation {
            changePassword(input: {
                oldPassword: "wrongpassword",
                newPassword: "newpassword"
            }) {
                ... on IDReturn {
                    id
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_change_password}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["changePassword"]["code"] == 'INVALID_PASSWORD'

@pytest.mark.asyncio
async def test_change_password_invalid_token(client, create_user):
    token = create_user("changepasswordinvalidtoken@example.com", "oldpassword", "Change", "Password")
    invalid_token = "invalidtoken"
    mutation_change_password = '''
        mutation {
            changePassword(input: {
                oldPassword: "oldpassword",
                newPassword: "newpassword"
            }) {
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    headers = {"Authorization": f"{invalid_token}"}
    response = client.post("/graphql", json={"query": mutation_change_password}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"] == None

@pytest.mark.asyncio
async def test_get_user(client, auth_headers):
    headers = auth_headers("getuser@example.com", "password", "Get", "User")
    query_get_user = '''
        query {
            user(id: 1) {
                id
                email
                firstName
                lastName
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_get_user}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    user_data = data["data"]["user"]
    assert user_data["email"] == "getuser@example.com"
    assert user_data["firstName"] == "Get"
    assert user_data["lastName"] == "User"

@pytest.mark.asyncio
async def test_delete_user(client, auth_headers):
    headers = auth_headers("deleteuser@example.com", "password", "Delete", "User")
    mutation_delete_user = '''
        mutation {
            deleteUser
        }
    '''
    response = client.post("/graphql", json={"query": mutation_delete_user}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["deleteUser"] == '1'

    mutation_login = '''
        mutation {
            login(input: {
                email: "deleteuser@example.com",
                password: "password"
            }) {
                ... on LoginPayload {
                    token {
                        token
                    }
                    user {
                        id
                        email
                    }
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_login})
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["login"]["code"] == 'LOGIN_ERROR'

@pytest.mark.asyncio
async def test_get_user_non_existent(client):
    query_get_user = '''
        query {
            user(id: 9999) {
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_get_user})
    data = response.json()
    assert response.status_code == 200
    assert data['data'] == None

@pytest.mark.asyncio
async def test_delete_user_invalid_token(client, create_user):
    token = create_user("deleteuserinvalidtoken@example.com", "password", "Delete", "User")
    invalid_token = "invalidtoken"
    mutation_delete_user = '''
        mutation {
            deleteUser
        }
    '''
    headers = {"Authorization": f"{invalid_token}"}
    response = client.post("/graphql", json={"query": mutation_delete_user}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"] == None

@pytest.mark.asyncio
async def test_create_user_duplicate_email(client):
    mutation_create_user = '''
        mutation {
            createUser(input: {
                email: "duplicateemail@example.com",
                password: "password",
                firstName: "Duplicate",
                lastName: "Email"
            }) {
                ... on LoginPayload {
                    token {
                        token
                    }
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_create_user})
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["createUser"]["token"]["token"] is not None

    # try to create the same user again
    response = client.post("/graphql", json={"query": mutation_create_user})
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["createUser"]["msg"] == "User already exists"
    assert data["data"]["createUser"]["code"] == "USER_EXISTS_ERROR"

@pytest.mark.asyncio
async def test_edit_bio(client, auth_headers):
    headers = auth_headers("editbio@example.com", "password", "Bio", "Edit")
    query_user_profile = '''
        mutation {
            userProfile {
                user {
                    id
                }
                bio
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    user_id = data["data"]["userProfile"]["user"]["id"]

    mutation_edit_bio = '''
        mutation {
            editBio(input: {
                bio: "This is a new bio"
            }) {
                ... on IDReturn {
                    id
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_edit_bio}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["editBio"]["id"] == str(user_id)

    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["userProfile"]["bio"] == "This is a new bio"

@pytest.mark.asyncio
async def test_edit_interests(client, auth_headers):
    headers = auth_headers("editinterests@example.com", "password", "Interests", "Edit")
    query_user_profile = '''
        mutation {
            userProfile {
                user {
                    id
                }
                interests
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    user_id = data["data"]["userProfile"]["user"]["id"]

    mutation_edit_interests = '''
        mutation {
            editInterests(input: {
                interests: [ARTIFICIAL_INTELLIGENCE, WEB_APPS]
            }) {
                ... on IDReturn {
                    id
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_edit_interests}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["editInterests"]["id"] == str(user_id)

    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    interests = data["data"]["userProfile"]["interests"]
    assert set(interests) == { "ARTIFICIAL_INTELLIGENCE", "WEB_APPS" }

@pytest.mark.asyncio
async def test_edit_name(client, auth_headers):
    headers = auth_headers("editname@example.com", "password", "Name", "Edit")
    query_user_profile = '''
        mutation {
            userProfile {
                user {
                    id
                }
                user {
                    firstName
                    lastName
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    user_id = data["data"]["userProfile"]["user"]["id"]

    mutation_edit_name = '''
        mutation {
            editName(input: {
                firstName: "NewFirstName",
                lastName: "NewLastName"
            }) {
                ... on IDReturn {
                    id
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_edit_name}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["editName"]["id"] == str(user_id)

    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    user_data = data["data"]["userProfile"]["user"]
    assert user_data["firstName"] == "NewFirstName"
    assert user_data["lastName"] == "NewLastName"

@pytest.mark.asyncio
async def test_edit_profile_pic(client, auth_headers):
    headers = auth_headers("editprofilepic@example.com", "password", "Profile", "Pic")
    query_user_profile = '''
        mutation {
            userProfile {
                user {
                    id
                }
                image
            }
        }
    '''
    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    user_id = data["data"]["userProfile"]["user"]["id"]

    mutation_edit_profile_pic = '''
        mutation {
            editProfilePic(input: {
                image: "newprofilepic.jpg"
            }) {
                ... on IDReturn {
                    id
                }
                ... on Error {
                    msg
                    code
                }
            }
        }
    '''
    response = client.post("/graphql", json={"query": mutation_edit_profile_pic}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["editProfilePic"]["id"] == str(user_id)

    response = client.post("/graphql", json={"query": query_user_profile}, headers=headers)
    data = response.json()
    assert response.status_code == 200
    assert data["data"]["userProfile"]["image"] is not None