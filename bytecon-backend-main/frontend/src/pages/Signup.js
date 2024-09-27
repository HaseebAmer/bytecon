import React, { useState } from 'react';
import { Button, Box, Typography, Grid, Avatar, CssBaseline, TextField, Container, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {  useMutation } from '@apollo/client';
import Cookies from 'js-cookie';
import { CREATE_USER } from '../components/utility/mutations';
import { clientA } from '../components/clients';
const defaultTheme = createTheme();



export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const [createUser] = useMutation(CREATE_USER, {
    client: clientA, 
    onCompleted: (data) => {
      const result = data.createUser;

      if (Cookies.get('token')) {
        Cookies.remove('token');
      }

      if (Cookies.get('id')) {
        Cookies.remove('id');
      }

      if (result.__typename === 'LoginPayload') {
        Cookies.set('token', data.createUser.token.token, {
          expires: 7,
          secure: true,
          sameSite: 'Strict'
        });

        Cookies.set('id', data.createUser.user.id, {
          expires: 7,
          secure: true,
          sameSite: 'Strict'
        });

        navigate('/main');
      } else if (result.__typename === 'Error') {
        setErr(data.createUser.msg);
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      setErr('Please enter a valid email address.');
      return;
    }
    if (firstName.length === 0) {
      setErr('Please enter your first name.');
      return;
    }
    if (lastName.length === 0) {
      setErr('Please enter your last name.');
      return;
    }
    if (password !== confirmPassword) {
      setErr('Passwords do not match!');
      return;
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }

    createUser({
      variables: {
        input: {
          email,
          password,
          firstName,
          lastName,
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
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  data-testid="first-name-field"
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={firstName}
                  onChange={handleFirstNameChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  data-testid="last-name-field"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={handleLastNameChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  data-testid="email-field"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  data-testid="password-field"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  data-testid="confirm-password-field"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
              </Grid>
            </Grid>
            <Typography style={{ color: 'red', fontWeight: 'bold' }}>
              {err}
            </Typography>
            <Button
              data-testid="signup-button"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link data-testid="login-link" href="/login" variant="body2">
                  Already have an account? Log in!
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
