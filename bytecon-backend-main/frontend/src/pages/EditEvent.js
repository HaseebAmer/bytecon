import React, { useState, useEffect } from "react";
import Sidebar from "../components/ChangedBar";
import { Grid, Container, Card, CardContent, Box, Typography, TextField, Button } from "@mui/material";
import ImageComponent from "../components/ImageComponent";
import { Tags, changeFormat } from "../components/utility/helpers";
import ErrorModal from "../components/ErrorModal";
import { useMutation } from '@apollo/client';
import { useMediaQuery, useTheme } from '@mui/material';
import DateTimePickerComponent from "../components/DateTimePickerComponent";
import dayjs from 'dayjs';
import { useLocation, useNavigate } from "react-router-dom";
import { clientB } from "../components/clients";
import { EDIT_EVENT } from "../components/utility/mutations";

export default function EditEvent() {
    const [image, setImage] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [eventName, setName] = useState('');
    const [eventDescr, setDescr] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('Please fill out all relevant fields.');

    const tagValues = Object.values(Tags);
    const theme = useTheme();
    const loc = useLocation();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 

    const [selectedDateTime, setSelectedDateTime] = useState(dayjs());

    const event = loc.state?.event || {};
    console.log(event)

    useEffect(() => {
        if (event) {
            setName(event.name || '');
            setDescr(event.description || '');
            setLocation(event.location || '');
            setSelectedDateTime(dayjs(event.datetime) || dayjs());
            setImage(event.image || null);
            setSelectedInterests(event.tags || []);
        }
    }, [event]);

    const handleDateTimeChange = (newValue) => {
        setSelectedDateTime(newValue);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const [editEvent] = useMutation(EDIT_EVENT, {
        client: clientB, 
        onCompleted: (data) => {
            console.log(data);
            const result = data.editEvent;
            if (result.__typename === 'Event') {
                console.log('this worked', data);
                navigate('/main')
            } else if (result.__typename === 'Error') {
                console.log('Unexpected response. Please try again.', result.msg);
                setMessage(result.msg)
                setOpenModal(true)
            }
        },
    });

    const handleEditEvent = () => {
        const cleanedEventName = eventName.trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
        const cleanedEventDescr = eventDescr.trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
        const cleanedLocation = location.trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
    
        if (!cleanedEventName || !cleanedEventDescr || !cleanedLocation) {
            setOpenModal(true);
            return;
        }

        const tagsInterests = selectedInterests.map(interest => Tags[interest]);
        const time = selectedDateTime.format('YYYY-MM-DDTHH:mm:ss');
        
        console.log(eventName, tagsInterests, location, eventDescr, time, image);
        
        editEvent({
            variables: {
                input: {
                    id: event.id,
                    name: eventName,
                    tags: tagsInterests,
                    location: location,
                    description: eventDescr,
                    datetime: time,
                    image: image
                }
            }
        })
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <Container maxWidth="lg" maxheight="md">
                <Box sx={{ marginTop: -7, paddingTop: 3, marginBottom: 0, fontSize: '15px', borderBottom: '1px solid grey' }}>
                    <Typography variant="h5" component="div">
                        Edit your event here
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={12}>
                        <Card variant="underlined" sx={{ marginTop: 2 }}>
                            <CardContent sx={{ pl: 0, pr: 0, height: '100%', pt: 1, pb: 0 }}>
                                <TextField
                                    id="event-name"
                                    label="Edit your event name"
                                    variant="outlined"
                                    size="large"
                                    fullWidth
                                    value={eventName}
                                    onChange={(e) => setName(e.target.value)}
                                    inputProps={{ maxLength: 25 }}
                                />
                                <Box
                                    display="flex"
                                    flexDirection={isSmallScreen ? 'column' : 'row'}
                                    alignItems="center"
                                    gap={2}
                                    sx={{ mt: 2 }}
                                >
                                    <TextField
                                        id="event-location"
                                        label="Edit your location"
                                        variant="outlined"
                                        size="large"
                                        fullWidth
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        inputProps={{ maxLength: 25 }}
                                        />

                                    <DateTimePickerComponent
                                        selectedDateTime={selectedDateTime}
                                        handleDateTimeChange={handleDateTimeChange}
                                    />
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <ImageComponent imageUrl={image} editable={1}    
                                        onImageUpload={(file) => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImage(reader.result);
                                            };
                                            if (file) {
                                                reader.readAsDataURL(file);
                                        }
                                    }} />
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <Grid container spacing={4} sx={{ mt: 0 }}>
                                        <Grid item xs={12} md={7}>
                                            <TextField
                                                id="event-descr"
                                                label="Add your event description here"
                                                variant="outlined"
                                                multiline
                                                rows={8}
                                                sx={{ color: '#797979', width: '100%' }}
                                                value={eventDescr}
                                                onChange={(e) => setDescr(e.target.value)}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={5}>
                                            <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', p: 2 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                    {tagValues.map((interest) => (
                                                        <Button
                                                            key={interest}
                                                            variant={selectedInterests.includes(interest) ? 'contained' : 'outlined'}
                                                            color="primary"
                                                            onClick={() => setSelectedInterests((prevSelectedInterests) =>
                                                                prevSelectedInterests.includes(interest)
                                                                    ? prevSelectedInterests.filter((i) => i !== interest)
                                                                    : [...prevSelectedInterests, interest]
                                                            )}
                                                            sx={{ borderRadius: '5px', textTransform: 'capitalize' }}
                                                        >
                                                            {changeFormat(interest)}
                                                        </Button>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleEditEvent}>
                            CONFIRM CHANGES
                        </Button>
                    </Grid>
                </Grid>
                <ErrorModal open={openModal} onClose={handleCloseModal} message={message} />
            </Container>
        </div>
    )
}
