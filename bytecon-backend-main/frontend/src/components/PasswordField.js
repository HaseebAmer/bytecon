import React from 'react';
import TextField from '@mui/material/TextField';

export default function PasswordField({onPasswordChange}) {
    return (
        <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => {onPasswordChange(e.target.value)}}
        />
    );
}
