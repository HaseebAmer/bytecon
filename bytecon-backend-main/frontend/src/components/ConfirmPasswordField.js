import React from 'react';
import TextField from '@mui/material/TextField';

export default function ConfirmPasswordField({onConfirmPasswordChange}) {
    return (
        <TextField
            margin="normal"
            required
            fullWidth
            name="confirm password"
            label="Confirm password"
            type="password"
            id="confirm password"
            autoComplete="current-password"
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
        />
    );
}
