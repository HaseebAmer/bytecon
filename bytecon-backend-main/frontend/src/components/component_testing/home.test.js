import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom';
import HomePage from "../../pages/Home";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock the useMediaQuery hook
jest.mock('@mui/material/useMediaQuery');

describe('Home Page', () => {
    test('renders mobile view of page', () => {
        render(
            <BrowserRouter>
                <MockedProvider>
                    <HomePage />
                </MockedProvider>
            </BrowserRouter>
        
    )
        expect(screen.getByTestId('logo-name')).toBeInTheDocument()
        expect(screen.getByTestId('sub-heading')).toBeInTheDocument()
        expect(screen.getByTestId('description')).toBeInTheDocument()
        expect(screen.getByTestId('find-event-button')).toBeInTheDocument()
    })

    test('renders desktop view of home page', () => {
        // Mock implementation for useMediaQuery
        useMediaQuery.mockImplementation(query => {
            // Return true for large screens
            return query === theme.breakpoints.up('lg');
        });
        // Create a custom theme with a specific breakpoint
        const theme = createTheme({
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 900,
                    lg: 1200,
                    xl: 1536,
                },
            },
        });

        // Mock the window width to simulate a large screen
        window.innerWidth = theme.breakpoints.values.lg + 100;
        window.dispatchEvent(new Event('resize'));

        render(
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </ThemeProvider>
        );

        // renders what is rendered on mobile
        expect(screen.getByTestId('logo-name')).toBeInTheDocument()
        expect(screen.getByTestId('sub-heading')).toBeInTheDocument()
        expect(screen.getByTestId('description')).toBeInTheDocument()
        expect(screen.getByTestId('find-event-button')).toBeInTheDocument()
        // Check if the login button is rendered on desktop
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        // Check if the signup button is rendered on desktop
        expect(screen.getByTestId('signup-button')).toBeInTheDocument();

    })
})