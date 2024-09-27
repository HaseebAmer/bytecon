import React from 'react';
import TextField from '@mui/material/TextField';

const EmailField = ({ autoFocus = false, onEmailChange, initialValue }) => {
    const handleChange = (e) => {
        onEmailChange(e.target.value);
    };

    return (
        <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus={autoFocus}
            value={initialValue}  // Ensure the value is passed to the TextField
            onChange={handleChange}  // Handle change events
        />
    );
};

export default EmailField;
