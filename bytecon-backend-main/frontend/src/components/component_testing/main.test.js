import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import MainPage from "../../pages/Main";
import React from "react"
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom';
import { GET_EVENTS } from '../utility/mutations';
import { clientB } from '../../components/clients';
import Sidebar from '../../components/ChangedBar';

jest.mock('../../components/ChangedBar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('../../components/EventCard', () => ({ event }) => <div data-testid="event-card">{event.name}</div>);
jest.mock('../../components/DateDropDownBtn', () => () => <button data-testid="date-dropdown">Date</button>);
jest.mock('../../components/DistanceDropDownBtn', () => () => <button data-testid="distance-dropdown">Distance</button>);
jest.mock('../../components/CategoryDropDownBtn', () => () => <button data-testid="category-dropdown">Category</button>);

const mocks = [
    {
      request: {
        query: GET_EVENTS,
        variables: {
          input: {
            first: 6,
            after: null,
          },
        },
      },
      result: {
        data: {
          getEvents: {
            edges: [
              {
                edge: {
                  id: '1',
                  name: 'Event 1',
                },
              },
              {
                edge: {
                  id: '2',
                  name: 'Event 2',
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor-2',
              hasNextPage: true,
            },
          },
        },
      },
    },
  ];

describe('Main Page', () => {
    test('renders Main Page content', () => {
        render(
            <BrowserRouter>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <MainPage />
                </MockedProvider>
            </BrowserRouter>
        )
        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('search-field')).toBeInTheDocument()
        expect(screen.getByTestId('event-grid')).toBeInTheDocument()
    });

    test('displays no events message when there are no events', async () => {
        const emptyMocks = [
          {
            request: {
              query: GET_EVENTS,
              variables: {
                input: {
                  first: 6,
                  after: null,
                },
              },
            },
            result: {
              data: {
                getEvents: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                  },
                },
              },
            },
          },
        ];
    
        render(
            <BrowserRouter>
                <MockedProvider mocks={emptyMocks} addTypename={false}>
                    <MainPage />
                </MockedProvider>
            </BrowserRouter>
        );
    
        await waitFor(() => {
          expect(screen.getByText('No events found.')).toBeInTheDocument();
        });
    });
})