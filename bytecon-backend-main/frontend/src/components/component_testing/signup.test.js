import SignupPage from "../../pages/Signup";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { CREATE_USER } from '../utility/mutations';
import Cookies from 'js-cookie';


// Mock navigate function
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));
  
// Mock cookies
jest.mock('js-cookie', () => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
}));

const mocks = [
    {
        request: {
        query: CREATE_USER,
        variables: {
            input: {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            },
        },
        },
        result: {
        data: {
            createUser: {
            __typename: 'LoginPayload',
            token: { token: 'test-token' },
            user: { id: 'test-id' },
            },
        },
        },
    },
];


describe('Sign Up Page', () => {
    test('renders sign up form fields', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <SignupPage />
                </MockedProvider>
            </BrowserRouter>
        
    )
        expect(screen.getByTestId('first-name-field')).toBeInTheDocument()
        expect(screen.getByTestId('last-name-field')).toBeInTheDocument()
        expect(screen.getByTestId('email-field')).toBeInTheDocument()
        expect(screen.getByTestId('password-field')).toBeInTheDocument()
        expect(screen.getByTestId('confirm-password-field')).toBeInTheDocument()
        expect(screen.getByTestId('signup-button')).toBeInTheDocument()
        expect(screen.getByTestId('login-link')).toBeInTheDocument()
    })

    test('shows error message when email is invalid', () => {

        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <SignupPage />
                </MockedProvider>
            </BrowserRouter>
        )

        fireEvent.change(screen.getByLabelText(/Email Address/i), {
          target: { value: 'invalid-email' },
        });
        fireEvent.change(screen.getByLabelText(/First Name/i), {
          target: { value: 'Test' },
        });
        fireEvent.change(screen.getByLabelText(/Last Name/i), {
          target: { value: 'User' },
        });
        fireEvent.change(screen.getByTestId('password-field').querySelector('input'), {
          target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
          target: { value: 'password123' },
        });
        fireEvent.click(screen.getByTestId('signup-button'));
    
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    test('shows error message when passwords do not match', () => {

        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <SignupPage />
                </MockedProvider>
            </BrowserRouter>
        )

        fireEvent.change(screen.getByTestId('email-field').querySelector('input'), {
          target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByTestId('first-name-field').querySelector('input'), {
          target: { value: 'Test' },
        });
        fireEvent.change(screen.getByTestId('last-name-field').querySelector('input'), {
          target: { value: 'User' },
        });
        fireEvent.change(screen.getByTestId('password-field').querySelector('input'), {
          target: { value: 'password123' },
        });
        fireEvent.change(screen.getByTestId('confirm-password-field').querySelector('input'), {
          target: { value: 'password124' },
        });
        fireEvent.click(screen.getByTestId('signup-button'));
    
        expect(screen.getByText('Passwords do not match!')).toBeInTheDocument();
    });
})