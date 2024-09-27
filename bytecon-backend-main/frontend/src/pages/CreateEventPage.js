import React, {useState, useEffect} from "react";
import Sidebar from "../components/ChangedBar";
import { Grid, Container, Card, CardContent, Box, Typography, TextField, Button } from "@mui/material";
import ImageComponent from "../components/ImageComponent";
import { Tags, changeFormat } from "../components/utility/helpers";
import ErrorModal from "../components/ErrorModal";
import { CREATE_EVENT } from "../components/utility/mutations";
import { useMutation } from '@apollo/client';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DateTimePickerComponent from "../components/DateTimePickerComponent";
import dayjs from 'dayjs';
import { clientB } from "../components/clients";
import { useNavigate } from "react-router-dom";

export default function CreateEventPage() {

    const [image, setImage] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [eventName, setName] = useState('')
    const [eventDescr, setDescr] = useState('')
    const [location, setLocation] = useState('')
    const [message, setMessage] = useState('Please fill out all relevant fields.')

    const tagValues = Object.values(Tags);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 
  
    const [selectedDateTime, setSelectedDateTime] = useState(dayjs().add(2, 'day').startOf('day')); 

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
    
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
      }, []);
  

    const navigate = useNavigate();
    const handleDateTimeChange = (newValue) => {
      setSelectedDateTime(newValue);
      console.log(newValue)
    };

    const handleMessage = (message) => {
        setMessage(message)
    }
  
    const [createEvent] = useMutation(CREATE_EVENT, {
        client: clientB, 
        onCompleted: (data) => {
            console.log(data);
            const result = data.createEvent;
            if (result.__typename === 'Event') {
                console.log('this worked', data);
                navigate('/main')
            } else if (result.__typename === 'Error') {
                console.log('Unexpected response. Please try again.', result.msg);
                handleMessage(result.msg)
                setOpenModal(true)
            }
        },
    });

    const handleEventName = (name) => {
        setName(name)
    }

    const handleEventLocation = (location) => {
        setLocation(location)
    }
    const handleEventDescription = (descr) => {
        setDescr(descr)
    }

    const handleImageUpload = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
        };
        if (file) {
          reader.readAsDataURL(file);
        }
      };
    const handleInterestToggle = (interest) => {
        setSelectedInterests((prevSelectedInterests) =>
          prevSelectedInterests.includes(interest)
            ? prevSelectedInterests.filter((i) => i !== interest)
            : [...prevSelectedInterests, interest],
        );
      };
    
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleCreate = () => {
        const cleanedEventName = eventName.trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
        const cleanedEventDescr = eventDescr.trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
        const cleanedLocation = location.trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
    
        if (!cleanedEventName || !cleanedEventDescr || !cleanedLocation) {
            setOpenModal(true);
            return;
        }


        const tagsInterests = selectedInterests.map(interest => Tags[interest]);
        const time = selectedDateTime.format('YYYY-MM-DDTHH:mm:ss');
        console.log(eventName, tagsInterests, location, eventDescr, time, image)
        
        createEvent({
            variables: {
                input: {
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
        <div style={{ display: 'flex'}}>
            <Sidebar />
            <Container maxWidth="lg" maxheight="md">
                <Box sx={{ marginTop: -7, paddingTop: 3, marginBottom: 0, fontSize: '15px', borderBottom: '1px solid grey' }}>
                    <Typography variant="h5" component="div">
                        Create an event here.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={12}>
                        <Card variant="underlined" sx={{ marginTop: 2 }}>
                        <CardContent sx={{ pl: 0, pr: 0, height: '100%', pt: 1, pb: 0 }}>
                            <TextField
                                id="outlined-basic"
                                label="Add an event name"
                                variant="outlined"
                                size="large"
                                fullWidth
                                onChange={(e) => handleEventName(e.target.value)} 
                                inputProps={{ maxLength: 25 }}

                            />
                            <Box
                                data-testid="date-time-picker"
                                display="flex"
                                flexDirection={isSmallScreen ? 'column' : 'row'}
                                alignItems="center"
                                gap={2}
                                sx={{mt:2}}
                            >
                                <TextField
                                id="outlined-basic"
                                label="Add a location"
                                variant="outlined"
                                size="large"
                                fullWidth
                                onChange={(e) => handleEventLocation(e.target.value)}
                                inputProps={{ maxLength: 25 }}
                                />

                                    <DateTimePickerComponent 
                                    selectedDateTime={selectedDateTime} 
                                    handleDateTimeChange={handleDateTimeChange} 
                                    />

                            </Box>
                            <Box sx={{ width: '100%' }}>

                            <ImageComponent imageUrl={image} onImageUpload={handleImageUpload} editable={1}/>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                

                                <Grid container spacing={4} sx ={{mt:0}}>
    
                                    <Grid item xs={12} md={7} >
                                        <TextField
                                            id="event-descr"
                                            label="Add your event description here"
                                            variant="outlined"
                                            multiline
                                            rows={8}
                                            sx={{ color: '#797979', width: '100%' }} 
                                            onChange={(e) => handleEventDescription(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={ 5 }>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', p:2}}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {tagValues.map((interest) => (
                                                    <Button
                                                    key={interest}
                                                    variant={selectedInterests.includes(interest) ? 'contained' : 'outlined'}
                                                    color="primary"
                                                    onClick={() => handleInterestToggle(interest)}
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
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleCreate}>
                        CREATE
                    </Button>
                </Grid>
            </Grid>
            <ErrorModal open={openModal} onClose={handleCloseModal}  message={message}/>
        </Container>
    </div>  
    )
}