import React from 'react';
import TextField from '@mui/material/TextField';

export default function NameField({ autoFocus = false, onFirstNameChange, onLastNameChange }) {
    return (
        <>
            <TextField
                margin="normal"
                required
                fullWidth
                id="first name"
                label="First name"
                name="first name"
                autoComplete="first name"
                autoFocus={autoFocus}
                onChange={(e) => {onFirstNameChange(e.target.value)}}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                id="last name"
                label="Last name"
                name="last name"
                autoComplete="last name"
                autoFocus={autoFocus}
                onChange={(e) => {onLastNameChange(e.target.value)}}
            />
        </>
    );
}