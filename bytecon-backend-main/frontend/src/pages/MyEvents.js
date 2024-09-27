import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Button, Card, CardContent, CircularProgress,  Typography } from '@mui/material';
import EventCard from '../components/EventCard';
import Sidebar from '../components/ChangedBar'; 
import { useQuery } from '@apollo/client';
import { GET_MY_EVENTS } from '../components/utility/mutations';
import { clientB } from "../components/clients";

export default function MyEvents() {

    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [events, setEvents] = useState([]);

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setScreenWidth(window.innerWidth);
  
      window.addEventListener('resize', handleResize);
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isSmallScreen = screenWidth < 450;
    
    const { loading, fetchMore, refetch } = useQuery(GET_MY_EVENTS, {
        client: clientB, 
        variables: {
                first: 8,
                after: null,
        },
        onCompleted: (data) => {
            const newEdges = data?.myEvents?.edges || [];
            const newEvents = newEdges.map(edge => edge.edge || {});
            setEvents(newEvents);
            console.log(data);
            const { pageInfo } = data?.myEvents || {};
            console.log(pageInfo)
            setCursor(pageInfo?.endCursor);
            setHasMore(pageInfo?.hasNextPage);
        },
        fetchPolicy: 'network-only' 
    });

    const handleNewEvents = (newEvents) => {
        setEvents(prevEvents => [...prevEvents, ...newEvents]);
    };


    const loadMore = () => {
        if (!hasMore || loading) return;

        fetchMore({
            variables: {
                    first: 8 ,
                    after: cursor,
                
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                console.log(fetchMoreResult, cursor)
                if (!fetchMoreResult?.myEvents) return previousResult;

                const newEdges = fetchMoreResult.myEvents.edges || [];
                const newEvents = newEdges.map(edge => edge.edge || {});
                console.log(newEvents);
                const { pageInfo } = fetchMoreResult?.myEvents || {};

                setCursor(pageInfo?.endCursor);
                setHasMore(pageInfo?.hasNextPage);
                handleNewEvents(newEvents);
            }
        }).catch(err => {
            console.error("Error fetching more events:", err);
        });
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        refetch();
        setCursor(null);
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', marginTop: "-30px", marginLeft: isSmallScreen ? '-30px' : '0px', marginRight: isSmallScreen ? '-30px': '0px' }}>
            <Sidebar style={{ width: '250px', flexShrink: 0 }} /> 
            <Container
                maxWidth={false} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '90vh', border: 0  }}
            >
                
                <Box sx={{ flex: 1, overflowY: 'auto', marginBottom: '20px', border: 0  }}>
                    <Typography variant="h5"> 
                        My Events
                    </Typography>
                    <Card variant='none'>
                        <CardContent>
                            <Grid container spacing={5}>
                                {loading ? (
                                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                                        <CircularProgress />
                                    </Grid>
                                ) : events.length > 0 ? (
                                    events.map(event => (
                                        <Grid item key={event.id}>
                                            <EventCard event={event} />
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <p>No events found.</p>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
                    {hasMore && !loading && (
                        <Button variant="contained" onClick={loadMore} disabled={loading}>
                            Load more...
                        </Button>
                    )}
                </Box>
                </Box>
            </Container>
        </div>
    );
}
