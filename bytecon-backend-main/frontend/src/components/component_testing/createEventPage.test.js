import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter} from 'react-router-dom';
import CreateEventPage from '../../pages/CreateEventPage';
import dayjs from 'dayjs';
import { CREATE_EVENT } from '../utility/mutations';
import Sidebar from '../../components/ChangedBar';
import ErrorModal from '../../components/ErrorModal';
import { Tags } from '../../components/utility/helpers';
import DateTimePickerComponent from '../../components/DateTimePickerComponent';
import { clientB } from '../../components/clients';
import { useNavigate } from 'react-router-dom';


jest.mock('../../components/ChangedBar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('../../components/ImageComponent', () => ({ imageUrl, onImageUpload }) => (
  <div data-testid="image-component">
    <input type="file" onChange={(e) => onImageUpload(e.target.files[0])} />
  </div>
));
jest.mock('../../components/ErrorModal', () => ({ open, onClose, message }) => (
  open ? <div data-testid="error-modal">{message}</div> : null
));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mocks = [
    {
      request: {
        query: CREATE_EVENT,
        variables: {
          input: {
            name: 'Test Event',
            tags: [],
            location: 'Test Location',
            description: 'Test Description',
            datetime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          },
        },
      },
      result: {
        data: {
          createEvent: {
            __typename: 'Event',
            id: '1',
            name: 'Test Event',
          },
        },
      },
    },
  ];

describe('CreateEventPage Component', () => {
    test('renders the create event page with sidebar and form fields', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <CreateEventPage />
                </MockedProvider>
            </BrowserRouter>
        );
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByLabelText('Add an event name')).toBeInTheDocument();
        expect(screen.getByLabelText('Add a location')).toBeInTheDocument();
        expect(screen.getByLabelText('Add your event description here')).toBeInTheDocument();
        expect(screen.getByTestId('date-time-picker')).toBeInTheDocument();
        expect(screen.getByTestId('image-component')).toBeInTheDocument();
    });

    test('displays error modal when fields are empty', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <CreateEventPage />
                </MockedProvider>
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText('CREATE'));
        expect(screen.getByTestId('error-modal')).toHaveTextContent('Please fill out all relevant fields.');
    });

    test('uploads image correctly', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <CreateEventPage />
                </MockedProvider>
            </BrowserRouter>
        );
        const file = new File(['image'], 'image.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('image-component').querySelector('input'), { target: { files: [file] } });
        expect(screen.getByTestId('image-component').querySelector('input').files[0]).toBe(file);
    });


});