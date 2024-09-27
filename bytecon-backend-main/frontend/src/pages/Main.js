import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Box, Button, Card, CardContent, CircularProgress, Select, MenuItem, Typography } from '@mui/material';
import EventCard from '../components/EventCard';
import Sidebar from '../components/ChangedBar'; 
import {  useMutation, useQuery } from '@apollo/client';
import { GET_EVENTS, GET_USER_PROFILE } from '../components/utility/mutations';
import { clientA, clientB } from "../components/clients";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { Tags } from '../components/utility/helpers';
import { changeFormat } from '../components/utility/helpers';

export default function MainPage() {

    const minDateTime = dayjs(); 
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState(minDateTime);
    const [toDate, setToDate] = useState(minDateTime.add(1, 'month'));
    const [userInfo, setInfo] = useState(null)
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setScreenWidth(window.innerWidth);
  
      window.addEventListener('resize', handleResize);
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isSmallScreen = screenWidth < 450;
    const isMediumScreen = screenWidth < 800;

    const [userData] = useMutation(GET_USER_PROFILE, {
        client: clientA,
        onCompleted: (data) => {
          console.log(data);
          setInfo(data)
        },
        onError: (error) => {
          console.log("error", error)
        }
      });
    
    const handleFilter = (event) => {
        setFilter(event.target.value);
        if (event.target.value != 'searchFilter') {
            setSearch('')
        }
        setSelectedTags([])
        setFromDate(minDateTime)
        setToDate(minDateTime.add(1, 'month'))
        setEvents([])

    };

    const handleTagChange = (event) => {
        setSelectedTags(event.target.value);
        setEvents([])

    };

    const handleFromDate = (newValue) => {
        setFromDate(newValue);
        console.log(newValue, toDate)
        if (newValue.isAfter(toDate)) {
            console.log('h')
          setToDate(newValue.add(1, 'month')); 
        }
        setEvents([])
      };

    const handleToDate = (event) => {
        setToDate(event)
        setEvents([])
    }

    const createFilterObject = () => {
        if (filter === '' || (search === '' && filter === 'searchFilter')) return null;
    
        const filterObj = {};
        console.log('Selected Tags:', selectedTags);
    
        if (filter === 'searchFilter' && search) {
            filterObj.searchFilter = {
                search: search
            }
        } else if (filter === 'dateFilter' && fromDate && toDate) {
            filterObj.dateFilter = {
                from_: fromDate ? fromDate.format('YYYY-MM-DDTHH:mm:ss') : null,
                to: toDate ? toDate.format('YYYY-MM-DDTHH:mm:ss') : null,
            };
        } else if (filter === 'relevanceFilter') {
            if (selectedTags.length > 0) {
                const tagsInterests = selectedTags.map(interest => Tags[interest]);
                console.log('Tags for relevance filter:', tagsInterests);
                filterObj.relevanceFilter = {
                    tags: tagsInterests
                };
            } else {
                const newTags = userInfo.userProfile.interests.map(interest => Tags[interest])

                if (!newTags) {
                    newTags = []
                }
                filterObj.relevanceFilter = {
                    tags: newTags
                };
            }
        }
    
        console.log('Filter Object:', filterObj);
        return filterObj;
    };
    

    const { loading, error, data, fetchMore, refetch } = useQuery(GET_EVENTS, {
        client: clientB, 
        variables: {
            input: {
                first: 8,
                after: null,
                filter: createFilterObject()
            }
        },
        onCompleted: (data) => {
            const newEdges = data?.getEvents?.edges || [];
            const newEvents = newEdges.map(edge => edge.edge || {});
            setEvents(newEvents);
            console.log(data);
            const { pageInfo } = data?.getEvents || {};
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
            client: clientB, 
            variables: {
                input: {
                    first: 8,
                    after: cursor,
                    filter: createFilterObject()
                }
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!fetchMoreResult?.getEvents) return previousResult;
                console.log(cursor)
                const newEdges = fetchMoreResult.getEvents.edges || [];
                const newEvents = newEdges.map(edge => edge.edge || {});
                console.log(fetchMoreResult);
                const { pageInfo } = fetchMoreResult?.getEvents || {};
                console.log(pageInfo)
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
        userData()
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const datePickerStyles = {
        mt: 3,
        '& .MuiInputLabel-root': {
          transform: isSmallScreen ? 'translate(10px, -1px) scale(0.75)' : 'translate(14px, -5px) scale(0.75)',
          fontSize: isMediumScreen ? '0.75rem' : '1rem', 
        },
        '& .MuiInputBase-root': {
          fontSize: isMediumScreen ? '0.75rem' : '0.8rem', 
          width: isMediumScreen ? '100px' : '200px', 
          height: '40px'
        },
      };

    const handleSearch = (event) => {
        setSearch(event.target.value)
        setFilter('searchFilter')
        setEvents([])
    }
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', marginTop: "-30px", marginLeft: isSmallScreen ? '-30px' : '0px', marginRight: isSmallScreen ? '-30px': '0px' }}>
            <Sidebar style={{ width: '250px', flexShrink: 0 }} /> 
            <Container
                maxWidth={false} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '90vh'}}
            >
                <Box sx={{ position: 'sticky', top: 0, marginBottom: '1px' }}>
                    
                    <TextField 
                        data-testid="search-field"
                        fullWidth 
                        label="Search events" 
                        variant="outlined" 
                        value={search}
                        onChange={handleSearch}
                    />
                    
                    <Box sx={{ display: 'flex', gap: '10px', marginTop: '20px', overflowX: 'auto' }}>
                            <Typography variant="caption" gutterBottom>
                                Filter:
                            </Typography>                        
                        <Select
                            labelId="filter-select-label"
                            id="filter-select"
                            value={filter || ''}
                            onChange={handleFilter}
                            label="Filter"
                            sx={{ height: '40px', fontSize: '0.7rem', mt: 3, ml: -5}}
                            inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem disabled value="">
                                <em>Placeholder</em>
                            </MenuItem>
                            <MenuItem value="relevanceFilter">Relevance</MenuItem>
                            <MenuItem value="dateFilter">Date</MenuItem>
                        </Select>
                        {filter === 'dateFilter' && (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="From"
                                    value={fromDate}
                                    sx={datePickerStyles}
                                    onChange={(newValue) => handleFromDate(newValue)}
                                    disablePast
                                />
                                <DatePicker
                                    label="To"
                                    value={toDate}
                                    sx={datePickerStyles}
                                    onChange={(newValue) => handleToDate(newValue)}
                                    disablePast
                                />
                            </LocalizationProvider>
                        )}

                        {filter === 'relevanceFilter' && (
                            <Select
                                labelId="tags-select-label"
                                id="tags-select"
                                multiple
                                value={selectedTags}
                                onChange={handleTagChange}
                                renderValue={(selected) => {
                                    return selected.map(tag => changeFormat(tag)).join(', ');
                                }}                                
                                sx={{ height: '40px', width: isSmallScreen ? '100px' : '200px', fontSize: '0.8rem', mt: 3 }}
                            >
                                {Object.keys(Tags).map(tagKey => (
                                    <MenuItem key={tagKey} value={tagKey}>
                                        {changeFormat(Tags[tagKey])}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </Box>
                </Box>
                <Box data-testid="event-grid" sx={{ flex: 1, overflowY: 'auto', marginBottom: '5px', border: 0  }}>
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
