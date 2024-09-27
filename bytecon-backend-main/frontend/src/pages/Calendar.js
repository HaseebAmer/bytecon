import React, { useEffect, useState } from "react";
import Sidebar from "../components/ChangedBar";
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { GET_CALENDAR } from "../components/utility/mutations";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Typography } from '@mui/material';
import { clientC, clientB } from "../components/clients";
import { GET_EVENT_BY_ID } from "../components/utility/mutations";
import { useNavigate } from "react-router-dom";
import './CustomCalendar.css'; 
const localizer = momentLocalizer(moment);



const CalendarPage = () => {
    const currentDateTime = moment('2024-08-01').format('YYYY-MM-DDTHH:mm:ss');
    const [date, setDate] = useState(currentDateTime);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setScreenWidth(window.innerWidth);
  
      window.addEventListener('resize', handleResize);
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isSmallScreen = screenWidth < 450;

    const {data, fetchMore } = useQuery(GET_CALENDAR, {
        client: clientC,
        variables: { input: { datetime: date } },
    });


    const fetchMoreEvents = () => {
        fetchMore({
            variables: { input: { datetime: date } },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                console.log(fetchMoreResult)
            }
        });
    };

    const [events, setEvents] = useState([]);
    let navigate = useNavigate()
    useEffect(() => {
        if (data && data.getCalendar && data.getCalendar.calendar) {
            const calendarEvents = data.getCalendar.calendar.map(event => ({
                id: event.id,
                title: event.name,
                start: new Date(event.datetime),
                end: new Date(moment(event.datetime).add(1, 'hour').toDate()),
            }));
            setEvents(calendarEvents);
        }
    }, [data]);

    const handleSelectEvent = async (event) => {
        const { data, loading, error } = await clientB.query({
            query: GET_EVENT_BY_ID,
            variables: { id: parseInt(event.id, 10) },
        });

        if (loading) {
            console.log('Loading event details...');
            return;
        }
        if (error) {
            console.error('Error fetching event details:', error);
            return;
        }
        console.log(data.getEventById)
        navigate(`/event/${encodeURIComponent(data.getEventById.name)}`, { state: { event: data.getEventById } });
    };

    

    const handleRangeChange = ({start, end}) => {
        const newStart = moment(start).add(10, 'days');        
        const formattedStart = newStart.format('YYYY-MM-DDTHH:mm:ss');
        setDate(formattedStart)
        fetchMoreEvents()
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', marginTop: "-30px", marginLeft: isSmallScreen ? '-40px': '10px' }}>
            <Sidebar style={{ width: '250px', flexShrink: 0 }} /> 
            <Container
                maxWidth={false} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '90vh', border: 0 }}
            > 
                <Typography variant="h4" gutterBottom>
                </Typography>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '80vh' }}
                    onSelectEvent={handleSelectEvent}
                    popup
                    onRangeChange={handleRangeChange}
                />  
            </Container>
        </div>
    );
};

export default CalendarPage;
