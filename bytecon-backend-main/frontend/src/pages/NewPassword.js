import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Button, Typography } from '@mui/material';

export default function NewPasswordPage() {
    const [err, setErr] = useState('')
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmission = () => {
        if (password !== confirmPassword) {
            setErr('Passwords do not match!')
        } else if (password.length < 8) {
            setErr('Password must be at least 8 characters long!')
        } else {
            setErr('Password was changed successfully!')
        }
    }
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{height: '20vh'}}></div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px'}}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Enter your new password
                    </Typography>
                <div>
                    <TextField onChange={(e) => {setPassword(e.target.value)}} sx={{minWidth: 350}} id="outlined-basic" type='password' label="New Password" variant="outlined" />
                </div>
                <div>
                    <TextField onChange={(e) => {setConfirmPassword(e.target.value)}} sx={{minWidth: 350}} id="outlined-basic"type='password' label="Confirm New Password" variant="outlined" />
                </div>
                <div style={{color: 'red', fontWeight: 'bold'}}>
                    {err}
                </div>
                <div>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleSubmission}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}
