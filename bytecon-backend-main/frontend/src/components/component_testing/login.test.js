import SignIn from "../../pages/Login"
import React from "react"
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LOGIN_USER } from "../utility/mutations";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

const mocks = [
{
    request: {
    query: LOGIN_USER,
    variables: {
        input: {
        email: 'test@example.com',
        password: 'password123',
        },
    },
    },
    result: {
    data: {
        login: {
        __typename: 'LoginPayload',
        token: {
            token: 'mockToken',
        },
        user: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@example.com',
        },
        },
    },
    },
},
];
  

describe('Login Page', () => {
    test('renders login form fields', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <ThemeProvider theme={defaultTheme}>
                        <SignIn />
                    </ThemeProvider>
                </MockedProvider>
            </BrowserRouter>
        )
        expect(screen.getByTestId('email-field')).toBeInTheDocument()
        expect(screen.getByTestId('password-field')).toBeInTheDocument()
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument()
        expect(screen.getByTestId('signup-link')).toBeInTheDocument()
    });
    test('handles input changes', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <ThemeProvider theme={defaultTheme}>
                        <SignIn />
                    </ThemeProvider>
                </MockedProvider>
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });
    test('shows error message for invalid email', async () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <ThemeProvider theme={defaultTheme}>
                        <SignIn />
                    </ThemeProvider>
                </MockedProvider>
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(screen.getByTestId('login-button'));
    
        await waitFor(() => {
          expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
        });
    });

    test('shows error message for short password', async () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <ThemeProvider theme={defaultTheme}>
                        <SignIn />
                    </ThemeProvider>
                </MockedProvider>
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.click(screen.getByTestId('login-button'));
    
        await waitFor(() => {
          expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
        });
    });
})