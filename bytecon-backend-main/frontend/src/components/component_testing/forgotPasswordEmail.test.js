import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter} from 'react-router-dom';
import { REQUEST_PASSWORD_RESET } from '../../components/utility/mutations';
import ForgotPasswordEmail from '../../pages/ForgotPasswordEmail';

const mocks = [
  {
    request: {
      query: REQUEST_PASSWORD_RESET,
      variables: {
        input: {
          email: 'test@example.com',
        },
      },
    },
    result: {
      data: {
        requestPasswordReset: {
          __typename: 'IDReturn',
          id: '1',
        },
      },
    },
  },
];

describe('ForgotPasswordEmail Component', () => {
  test('renders ForgotPasswordEmail component with email input and submit button', () => {
    render(
        <BrowserRouter>
          <MockedProvider mocks={mocks} addTypename={false}>
            <ForgotPasswordEmail />
          </MockedProvider>
      </BrowserRouter>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Submit Email')).toBeInTheDocument();
  });

  test('handles email input change', () => {
    render(
        <BrowserRouter>
          <MockedProvider mocks={mocks} addTypename={false}>
            <ForgotPasswordEmail />
          </MockedProvider>
      </BrowserRouter>
    );
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  test('shows error message for invalid email', async () => {
    render(
        <BrowserRouter>
          <MockedProvider mocks={mocks} addTypename={false}>
            <ForgotPasswordEmail />
          </MockedProvider>
      </BrowserRouter>
    );
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByText('Submit Email'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  test('triggers forgotPassword mutation and shows success message', async () => {
    render(
        <BrowserRouter>
          <MockedProvider mocks={mocks} addTypename={false}>
            <ForgotPasswordEmail />
          </MockedProvider>
      </BrowserRouter>
    );
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Submit Email'));

    await waitFor(() => {
      expect(screen.getByText('A temporary link has been successfully sent to your email!')).toBeInTheDocument();
    });
  });
});
