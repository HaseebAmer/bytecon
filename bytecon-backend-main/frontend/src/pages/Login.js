import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { LOGIN_USER } from '../components/utility/mutations';
import { useMutation } from '@apollo/client';
import Cookies from 'js-cookie';
import { clientA } from '../components/clients';

const defaultTheme = createTheme();

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const [loginUser] = useMutation(LOGIN_USER, {
    client: clientA, 
    onCompleted: (data) => {
      const result = data.login;
      console.log(data);

      if (Cookies.get('token')) {
        Cookies.remove('token'); 
      }

      if (Cookies.get('id')) {
        Cookies.remove('id');
      }

      if (result.__typename === 'LoginPayload') {
        Cookies.set('token', data.login.token.token, {
          expires: 7, 
          secure: true,
          sameSite: 'Strict',
        });

        Cookies.set('id', data.login.user.id, {
          expires: 7, 
          secure: true, 
          sameSite: 'Strict', 
        });
        console.log('Login successful', data);
        navigate('/main');
      } else if (result.__typename === 'Error') {
        setErr(result.msg);
        console.log('Unexpected response. Please try again.', result.msg);
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setErr('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    loginUser({
      variables: {
        input: {
          email,
          password,
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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              data-testid="email-field"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleEmailChange}
            />
            <TextField
              data-testid="password-field"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handlePasswordChange}
            />
            <Link data-testid="forgot-password-link" href="/forgot-password-enter-email" variant="body2">
              Forgot your password? Click here!
            </Link>
            <Typography sx={{ color: 'red', fontWeight: 'bold', ml: 12 }}>
              {err}
            </Typography>
            <Button
              data-testid="login-button"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item>
                <Link data-testid="signup-link" href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
