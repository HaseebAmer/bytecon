import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ... on LoginPayload {
        token {
          token
        }
        user {
          id
          email
          firstName
          lastName
        }
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($input: LoginUserInput!) {
    login(input: $input) {
      ... on LoginPayload {
        token {
          token
        }
        user {
          id
          email
          firstName
          lastName
        }
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;

export const GET_ME = gql`
  query {
    me {
      id
      firstName
      lastName
      email
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation requestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      ... on IDReturn {
        id
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;

export const REQUEST_PASSWORD_EMAIL_TOKEN = gql`
  mutation passwordReset($input: PasswordResetInput!) {
    passwordReset(input: $input) {
      ... on Error {
        msg
        code
      }
      ... on IDReturn {
        id
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
    mutation {
        userProfile {
            user {
                id
                firstName
                lastName
                email
            }
            bio
            interests
            image
        }
    }
`;

export const EDIT_BIO = gql`
    mutation editBio($input: EditBioInput!) {
        editBio(input: $input) {
            ... on IDReturn {
                id
            }
            ... on Error {
                msg
                code
            }
        }
    }
`;

export const EDIT_INTERESTS = gql`
    mutation editInterests($input: EditInterestsInput!) {
        editInterests(input: $input) {
            ... on IDReturn {
                id
            }
            ... on Error {
                msg
                code
            }
        }
    }
`;

export const EDIT_PROFILE_PIC = gql`
    mutation editProfilePic($input: EditImageInput!) {
        editProfilePic(input: $input) {
            ... on IDReturn {
                id
            }
            ... on Error {
                msg
                code
            }
        }
    }
`;


export const EDIT_NAME = gql`
    mutation editName($input: EditNameInput!) {
        editName(input: $input) {
            ... on IDReturn {
                id
            }
            ... on Error {
                msg
                code
            }
        }
    }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      ... on Event {
        id
        name
        description
        datetime
        createdBy
        image
        tags
      }
      ... on Error {
        code
        msg
      }
    }
  }
`;


 

export const ADD_TO_CALENDAR = gql`
  mutation AddToCalendar($input: EventInput!) {
    addToCalendar(input: $input) {
      ... on Success {
        success
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;


export const GET_CALENDAR = gql`
  query GetCalendar($input: GetCalendarInput!) {
    getCalendar(input: $input) {
      ... on GetCalendarResult {
        calendar {
          id
          name
          description
          location
          tags
          createdBy
          datetime
        }
      }
    }
  }
`;

 

export const GET_MY_EVENTS = gql`
  query GetMyEvents($first: Int!, $after: String) {
    myEvents(first: $first, after: $after) {
      ... on EventConnection {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          cursor
          edge {
            id
            name
            tags
            location
            description
            datetime
            createdBy
            image
          }
        }
      }
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents($input: GetEventInput!) {
    getEvents(input: $input) {
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
            createdBy
            image
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;


export const REMOVE_FROM_CALENDAR = gql`
  mutation RemoveFromCalendar($id: Int!) {
    removeFromCalendar(id: $id) {
      ... on Success {
        success
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;


export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: Int!) {
    deleteEvent(id: $id) {
      ... on Success {
        success
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;


export const EDIT_EVENT = gql`
  mutation EditEvent($input: EditEvent!) {
    editEvent( input: $input) {
      ... on Event {
        id
        name
        description
        datetime
        tags
        location
      }
      ... on Error {
        code
        msg
      }
    }
  }
`;

export const GET_EVENT_BY_ID = gql`
  query GetEventById($id: Int!) {
    getEventById(id: $id) {
      ... on Event {
        id
        name
        tags
        location
        description
        datetime
        createdBy
        image
      }
      ... on Error {
        msg
        code
      }
    }
  }
`;