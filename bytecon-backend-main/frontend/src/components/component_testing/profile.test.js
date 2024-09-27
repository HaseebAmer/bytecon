import Profile from "../../pages/Profile";
import React from "react"
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { GET_USER_PROFILE, EDIT_BIO} from '../../components/utility/mutations';

// Mock GraphQL queries and mutations
const mocks = [
    {
      request: {
      query: GET_USER_PROFILE,
      },
      result: {
        data: {
          userProfile: {
            user: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
            },
            bio: 'I love science',
            interests: ['Technology', 'Science'],
            image: 'profile-image-url',
          },
        },
      },
    },
    {
      request: {
        query: EDIT_BIO,
        variables: { input: { bio: 'Updated bio' } },
      },
      result: {
        data: {
          changeBio: {
            bio: 'Updated bio',
          },
        },
      },
    },
];

describe('Profile Component', () => {
  test('renders user profile page', () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Profile />
        </MockedProvider>
    </BrowserRouter>
    );
    expect(screen.getByTestId('profile-img')).toBeInTheDocument();
    expect(screen.getByTestId('edit-img')).toBeInTheDocument();
    expect(screen.getByTestId('delete-account-btn')).toBeInTheDocument();
    expect(screen.getByTestId('interest-field')).toBeInTheDocument();
    const interestButton = screen.getByText('Robotics');
    fireEvent.click(interestButton);
    expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
    expect(screen.getByTestId('save-btn')).toBeInTheDocument();

  });
  // test('renders Profile component with name', async () => {
  //   render(
  //     <BrowserRouter>
  //       <MockedProvider mocks={mocks} addTypename={false}>
  //         <Profile />
  //       </MockedProvider>
  //   </BrowserRouter>
  //   );
  //   await waitFor(() => {
  //     expect(screen.getByText('John Doe')).toBeInTheDocument();
  //   });
  // });
  // test('renders Profile component with email', async () => {
  //   render(
  //     <BrowserRouter>
  //       <MockedProvider mocks={mocks} addTypename={false}>
  //         <Profile />
  //       </MockedProvider>
  //     </BrowserRouter>
  //   );
  //   await waitFor(() => {
  //     expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  //   });
  // });

  test('renders Profile component with bio', async () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Profile />
        </MockedProvider>
      </BrowserRouter>
    );
      await waitFor(() => {
        expect(screen.getAllByText('Add a bio here').length).toBeGreaterThan(0);
      });
  });
  
  test('renders and updates bio field', async () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Profile />
        </MockedProvider>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Add a bio here')).toBeInTheDocument();
    });
    render(
          <BrowserRouter>
              <MockedProvider mocks={mocks} addTypename={false}>
                  <Profile />
              </MockedProvider>
          </BrowserRouter>
    );  

    const bioInput = screen.getByLabelText('Add a bio here');
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });
    expect(bioInput.value).toBe('Updated bio');
    });
  
  test('toggles interest selection', async () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Profile />
        </MockedProvider>
      </BrowserRouter>
    );  
    await waitFor(() => {
      expect(screen.getByText('Robotics')).toBeInTheDocument();
    });
  
    const interestButton = screen.getByText('Robotics');
    fireEvent.click(interestButton);
    expect(interestButton).toHaveClass('MuiButton-contained'); // Toggle off

    fireEvent.click(interestButton);
    expect(interestButton).toHaveClass('MuiButton-outlined'); // Toggle on
  });
  
  test('deletes account', async () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Profile />
        </MockedProvider>
      </BrowserRouter>
    );  
    await waitFor(() => {
      expect(screen.getByText('DELETE ACCOUNT')).toBeInTheDocument();
    });
  
    const deleteButton = screen.getByText('DELETE ACCOUNT');
    fireEvent.click(deleteButton);
  
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Profile />
        </MockedProvider>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument(); // User details should no longer be visible
    });
  });
});