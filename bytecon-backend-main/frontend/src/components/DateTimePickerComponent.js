import React , {useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

const DateTimePickerComponent = ({ selectedDateTime, handleDateTimeChange }) => {
  const minDateTime = dayjs().add(2, 'day').startOf('day'); 
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMediumScreen = screenWidth < 900;

  return (
    <LocalizationProvider  dateAdapter={AdapterDayjs}>
      <MobileDateTimePicker
        renderInput={(params) => <TextField {...params} />}
        value={selectedDateTime}
        onChange={(newValue) => handleDateTimeChange(newValue)}
        label="Select Date and Time"
        inputFormat="MM/DD/YYYY hh:mm A"
        ampm
        minDateTime={minDateTime}
        sx={{width:   isMediumScreen ? '100%' : '50%'}}
      />
    </LocalizationProvider>
  );
};

export default DateTimePickerComponent;
