import React, { useState } from 'react';
import Sidebar from '../components/ChangedBar';
import { Grid, Container, Card, CardContent, Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import ImageComponent from '../components/ImageComponent';
import { changeFormat } from '../components/utility/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_TO_CALENDAR, REMOVE_FROM_CALENDAR, GET_CALENDAR, DELETE_EVENT } from '../components/utility/mutations'; 
import { clientB, clientC } from '../components/clients';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';

const EventDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(null); 
    const [isInCalendar, setIsInCalendar] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const currentUserId = Cookies.get('id');
    const event = location.state?.event || {};

    const {
        id, 
        name,
        description,
        location: eventLocation,
        datetime,
        tags,
        createdBy,
        image
    } = event;

    const dayjsDate = dayjs(datetime);
    const firstOfMonth = dayjsDate.startOf('month').add(1, 'day');    
    const formattedDate = firstOfMonth.toISOString();

    const { loading: calendarLoading} = useQuery(GET_CALENDAR, {
        client: clientC,
        variables: { input: { datetime: formattedDate } },
        onCompleted: (data) => {
            const eventId = event?.id;
            setIsInCalendar(data?.getCalendar?.calendar.some(item => item.id === eventId));
        }
    });

    const [addToCalendar, { loading: addLoading}] = useMutation(ADD_TO_CALENDAR, {
        client: clientC,
        onCompleted: (data) => {
            if (data.addToCalendar.__typename === 'Success') {
                setSuccess('Added');
            } else {
                console.error('Error adding event to calendar:', data.addToCalendar.msg);
                setSuccess('Error'); 
            }
        },
        onError: (error) => {
            console.error('GraphQL error:', error);
            setSuccess('Error'); 
        },
    });

    const [deleteEvent, { loading: deleteLoading }] = useMutation(DELETE_EVENT, {
        client: clientB,
        onCompleted: (data) => {
            console.log(data)
            if (data.deleteEvent.__typename === 'Success') {
                navigate('/my-events')
            } else {
                console.error('didnt work');
            }
        },
        onError: (error) => {
            console.error('GraphQL error:', error);
        },
    });


    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);

    const handleDeleteEvent = () => {
        deleteEvent({
            variables: {
                id: parseInt(event.id, 10)
            }
        })
        handleCloseDeleteModal();
    }

    const [removeFromCalendar, { loading: removeLoading}] = useMutation(REMOVE_FROM_CALENDAR, {
        client: clientC,
        onCompleted: (data) => {
            if (data.removeFromCalendar.__typename === 'Success') {
                setSuccess('Removed');
            } else {
                console.error('Error removing event from calendar:', data.removeFromCalendar.msg);
                setSuccess('Error'); 
            }
        },
        onError: (error) => {
            console.error('GraphQL error:', error);
            setSuccess('Error'); 
        },
    });

    const handleAddToCalendar = () => {
        addToCalendar({
            variables: {
                input: {
                    eventId: id,
                    name,
                    tags,
                    location: eventLocation,
                    description,
                    datetime,
                    createdBy,
                }
            }
        });
    };

    const handleRemoveFromCalendar = () => {
        removeFromCalendar({
            variables: {
                id: parseInt(event.id, 10),
            }
        });
    };

    const handleBack = () => {
        navigate('/main');
    };

    const handleEditEvent = () => {
        navigate(`/edit-event/${encodeURIComponent(event.name)}`, { state: { event } });
    }

    if (!event) {
        return <Typography>No event data available</Typography>;
    }

    const isButtonDisabled = calendarLoading || addLoading || removeLoading || success;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <Container maxWidth="lg">
                <Box sx={{ marginTop: -7, paddingTop: 3, marginBottom: 0}}>
                    <Typography variant="h3" component="div" sx={{fontSize: '2rem'}}>
                        {name}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={12}>
                        <Card variant="bordered" sx={{ marginTop: 2 }}>
                            <CardContent sx={{ pl: 0, pr: 0, height: '100%', pt: 1, pb: 0 }}>
                                <Typography variant="b2" component="div" sx={{ mt: 1 }}>
                                    {eventLocation}
                                </Typography>
                                <Typography variant="b2" sx={{ mt: 4}}>
                                    {dayjs(datetime).format('MMMM D, YYYY h:mm A')}
                                </Typography>
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <ImageComponent imageUrl={image} editable={0}/>
                                </Box>
                                <Typography
                                    variant="body1"
                                    paragraph
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {description}
                                </Typography>


                                <Box sx={{ p: 2, mt: 2 }}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {tags?.map(tag => (
                                            <Typography
                                                key={tag}
                                                variant="body2"
                                                sx={{ borderRadius: '5px', textTransform: 'capitalize', backgroundColor: '#f0f0f0', p: '4px 8px' }}
                                            >
                                                {changeFormat(tag)}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' }, 
                                gap: 2, 
                                mt: 2
                            }}
                        >
                        <Button 
                            variant="outlined" 
                            color={isInCalendar ? 'error' : 'primary'} 
                            sx={{ borderRadius: 10, fontSize: '0.8rem', height: '50px' }} 
                            onClick={isInCalendar ? handleRemoveFromCalendar : handleAddToCalendar} 
                            disabled={isButtonDisabled}
                        >
                            {success === 'Added' || success === 'Removed' ? (
                                <><CheckCircleIcon sx={{ mr: 1 }} /> Success</>
                            ) : calendarLoading || addLoading || removeLoading ? (
                                'Processing...'
                            ) : isInCalendar ? (
                                'Remove from Calendar'
                            ) : (
                                'Add to Calendar'
                            )}
                        </Button>
                        <Button variant="outlined" color="primary" sx={{   borderRadius: 10, fontSize: '0.8rem', height: '50px'  }} onClick={handleBack}>
                            Back to Events
                        </Button>
                        {parseInt(createdBy, 10) === parseInt(currentUserId, 10) && (
                            <Box sx={{ display: 'flex', gap: '10px'}}>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    onClick={handleOpenDeleteModal}
                                    sx={{ flex: 1, borderRadius: 10, fontSize: '0.8rem', height: '50px'  }}
                                >
                                    Delete
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="secondary" 
                                    onClick={handleEditEvent}
                                    sx={{ flex: 1, borderRadius: 10, fontSize: '0.8rem', height: '50px'  }}
                                >
                                    Edit
                                </Button>
                            </Box>
                        )}
                                </Box>
                    </Grid>
                </Grid>

                <Dialog
                    open={openDeleteModal}
                    onClose={handleCloseDeleteModal}
                >
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this event?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteModal}>Cancel</Button>
                        <Button 
                            onClick={handleDeleteEvent} 
                            color="error"
                            disabled={deleteLoading} 
                            
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
};

export default EventDetailsPage;
