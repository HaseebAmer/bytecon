import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { REQUEST_PASSWORD_RESET } from '../components/utility/mutations';
import { useMutation } from '@apollo/client';
import { clientA } from '../components/clients';

export default function ForgotPasswordEmail() {
    const navigate = useNavigate()
    const [err, setErr] = useState('')
    const [email, setEmail] = useState('')
    const [hiddenCode, setHiddenCode] = useState(true)
    const [code, setCode] = useState('')

    const [forgotPassword, { data, error }] = useMutation(REQUEST_PASSWORD_RESET, {
        client: clientA,
        onCompleted: (data) => {
            console.log(data);
          const result = data.requestPasswordReset;
          if (result.__typename === 'IDReturn') {
            console.log('this worked', data);
          } else if (result.__typename === 'Error') {
            setErr(result.msg);
            console.log('Unexpected response. Please try again.', result.msg);
          }
        },
      });

    const handleEmailSubmission = (e) => {
        e.preventDefault()
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            setErr('Please enter a valid email address.')
        } else {
            setErr('A temporary link has been successfully sent to your email!')
        }
        forgotPassword({
            variables: {
              input: {
                email,
              },
            },
          });
    }


    return (
        <div style={{display: 'flex', flexDirection: 'column', marginRight: 100}}>
            <div style={{height: '20vh'}}></div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px'}}>
                {hiddenCode &&
                    <Typography component="h1" variant="h5" align="center" gutterBottom sx={{fontFamily: 'sans-serif'}}>
                        Enter your email
                    </Typography>
                }
                {!hiddenCode &&
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Enter your code
                    </Typography>
                }
                <div>
                    <TextField onChange={(e) => {setEmail(e.target.value)}} sx={{minWidth: 300}} id="outlined-basic" type='email' label="Email" variant="outlined" disabled={!hiddenCode} />
                </div>
                <div style={{fontWeight: 'bold', maxWidth: 300, textAlign: 'center'}}>
                    {err}
                </div>
                {!hiddenCode &&
                    <div>
                        <TextField onChange={(e) => {setCode(e.target.value)}} sx={{minWidth: 300}} id="outlined-basic" type='text' label="Code" variant="outlined" />
                    </div>
                }
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    {hiddenCode && 
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2, maxWidth: 300 }}
                        onClick={handleEmailSubmission}

                    >
                        Submit Email
                    </Button>
                    }
                </div>
            </div>
        </div>
    );
}
