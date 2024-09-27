import React, { useState } from 'react';
import { TextField, Button, Box, Container, Avatar, Typography, CssBaseline, FormControl, InputLabel, InputAdornment, IconButton, OutlinedInput } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_EMAIL_TOKEN } from '../components/utility/mutations';
import { clientA } from '../components/clients';
const defaultTheme = createTheme();

const ResetPassword = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  console.log(token);

  const [inputs, setInputs] = useState({
    password: '',
  });
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [resetPassword] = useMutation(REQUEST_PASSWORD_EMAIL_TOKEN, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data);
      setConfirm('Succesfully reset password')
      navigate('/login')
    },
    onError: (error) => {
      console.error(error);
      setErr('An error occurred. Please try again.');
    },
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    handleInputChange(event);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { password } = inputs;

    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }

    resetPassword({
      variables: {
        input: {
          emailToken: token,
          newPassword: password,
        },
      },
    });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: 5,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <FormControl sx={{ m: 1, width: '40vh' }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">New Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={inputs.password}
                name="password"
                onChange={handlePasswordChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
              />
            </FormControl>
            <Typography sx={{ color: 'red', fontWeight: 'bold', ml: 5 }}>
              {err}
            </Typography>
            <Typography sx={{ color: 'green', fontWeight: 'bold', ml: 5 }}>
              {confirm}
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Reset Password
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default ResetPassword;
