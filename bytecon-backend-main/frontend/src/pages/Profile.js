import React, { useState, useEffect } from 'react';
import Sidebar from '../components/ChangedBar';
import { Container, Box, Grid, Card, CardContent, Typography, TextField, Avatar, Button, IconButton, FormControl, InputLabel, Input, Dialog, DialogActions, DialogContent, DialogTitle  } from '@mui/material';
import { useMutation } from '@apollo/client';
import { EDIT_BIO, EDIT_INTERESTS, EDIT_NAME, EDIT_PROFILE_PIC, GET_USER_PROFILE, DELETE_ACCOUNT} from '../components/utility/mutations';
import profileImg from '../components/profile-default.svg';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Tags, changeFormat } from '../components/utility/helpers';
import { clientA } from '../components/clients';

const Profile = () => {
  const [getUserProfile, { data }] = useMutation(GET_USER_PROFILE, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log("error", error)
    }
  });
  const [changeBio] = useMutation(EDIT_BIO, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data);
    },
  });
  const [changePic] = useMutation(EDIT_PROFILE_PIC, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log("error", error)
    }
  });
  const [changeInterests] = useMutation(EDIT_INTERESTS, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log("error", error)
    }
  });

  const [changeName] = useMutation(EDIT_NAME, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log("error", error)
    }
  });

  const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
    client: clientA,
    onCompleted: (data) => {
      console.log(data, "accoutn hasbeen deleted");

      if (Cookies.get('token')) {
        Cookies.remove('token'); 
      }

      if (Cookies.get('id')) {
        Cookies.remove('id');
      }
    
      navigate('/home')
    }, 
    onError: (error) => {
      console.log(error)
    }
  });

  const [, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(profileImg);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const navigate = useNavigate();
  const tagValues = Object.values(Tags);


  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (data && data.userProfile) {
      const { user, bio, interests, image } = data.userProfile;
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setBio(bio || '');
      setSelectedInterests(interests || []);
      setProfilePicture(`${image}`);
    }
  }, [data]);

  const handleFirstNameChange = (newFirstName) => {
    setFirstName(newFirstName);
    setButtonVisible(true);
  };

  const handleLastNameChange = (newLastName) => {
    setLastName(newLastName);
    setButtonVisible(true);
  };

  const handleBioChange = (newBio) => {
    setBio(newBio);
    setButtonVisible(true);
  };


  const handleDeleteAccount = () => {
    deleteAccount()
    handleCloseDeleteModal();
  }
  const handleButtonClick = () => {

    if (data?.userProfile.bio !== bio) {
      changeBio({
        variables: {
          input: {
            bio: bio,
          },  
        },
      });
    }
    
    
    const tagsInterests = selectedInterests.map(interest => Tags[interest]);
    changeInterests({
      variables: {
        input: {
          interests: tagsInterests,
        },
      },
    });

    changePic({
      variables: {
        input: {
          image: profilePicture,
        },
      },
    });

    changeName({
      variables: {
        input: {
          firstName: firstName,
          lastName: lastName
        }
      },
    });
    
    setButtonVisible(false);
  };

  const handleCancelClick = () => {
    window.location.reload();
  };

  const handleInterestToggle = (interest) => {
    setSelectedInterests((prevSelectedInterests) =>
      prevSelectedInterests.includes(interest)
        ? prevSelectedInterests.filter((i) => i !== interest)
        : [...prevSelectedInterests, interest],
    );
    setButtonVisible(true);
  };

  const handleFileChange = (event) => {
    setButtonVisible(true);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePicture(reader.result); 
    };

    if (file) {
      reader.readAsDataURL(file); 
    }
  };


  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  return (
    <div style={{ display: 'flex', marginLeft: '-40px', marginRight: '-40px' }}>
      <Sidebar />
      <Container maxWidth="lg" maxheight="md">
        <Box sx={{ marginTop: -7, paddingTop: 3, marginBottom: 6, fontSize: '15px', borderBottom: '1px solid grey' }}>
          <Typography variant="h5" component="div">
            Account Settings.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your personal information here.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ marginTop: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Avatar
                    data-testid="profile-img"
                    alt="Profile Image"
                    src={profilePicture}
                    sx={{
                      width: 200,
                      height: 200,
                      mb: 2,
                      position: 'relative',
                    }}
                  />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="raised-button-file">
                    <IconButton
                      color="black"
                      aria-label="upload picture"
                      component="span"
                    >
                      <EditIcon data-testid="edit-img" />
                    </IconButton>
                  </label>
                </Box>
                <Box
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <Typography variant="h5" component="div" align="center">
                    {firstName} {lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {email}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center">
                    {bio}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card variant='underlined' sx={{ minHeight: '80vh' }}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
                  <FormControl variant="standard">
                    <InputLabel htmlFor="email-field">Email</InputLabel>
                    <Input
                        id="email-field"
                        value={email}
                        disabled
                    />
                  </FormControl>
                  <FormControl variant="standard">
                    <InputLabel htmlFor="email-field">First Name</InputLabel>
                    <Input
                        id="email-field"
                        value={firstName}
                        onChange={(e) => handleFirstNameChange(e.target.value)}

                    />
                  </FormControl>
                  <FormControl variant="standard">
                    <InputLabel htmlFor="email-field">Last Name</InputLabel>
                    <Input
                        id="email-field"
                        value={lastName}
                        onChange={(e) => handleLastNameChange(e.target.value)}

                    />
                  </FormControl>
                  <TextField
                    data-testid="bio-field"
                    id="bio"
                    label="Add a bio here"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={bio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    sx={{ color: '#797979' }} 
                  />
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  Interests
                </Typography>

                <Box data-testid="interest-field" sx={{ mt: 1, border: '1px solid #ccc', borderRadius: '5px', padding: '20px'}}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', mt: 2}}>
                    {tagValues.map((interest) => (
                      <Button
                        key={interest}
                        variant={selectedInterests.includes(interest) ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => handleInterestToggle(interest)}
                        sx={{ borderRadius: '5px', textTransform: 'capitalize', fontSize: '0.7rem' }}
                      >
                        {changeFormat(interest)}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {buttonVisible && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 3, 
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' } 
                    }}
                  >
                    <Button
                      data-testid="save-btn"
                      variant="contained"
                      color="primary"
                      onClick={handleButtonClick}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      SAVE
                    </Button>
                    
                    <Button
                      data-testid="cancel-btn"
                      variant="contained"
                      color="secondary"
                      onClick={handleCancelClick}
                      sx={{ width: { xs: '100%', sm: 'auto' } }} 
                    >
                      CANCEL
                    </Button>
                  </Box>
                )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 0, 
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' } 
                    }}
                  >
                    <Button data-testid="delete-account-btn" sx={{ mt: 3 }} color="error" variant="outlined" onClick={handleOpenDeleteModal}>
                      DELETE ACCOUNT
                    </Button>
                  </Box>
              </CardContent>
            </Card>

          </Grid>
        </Grid>

        <Dialog
              open={openDeleteModal}
              onClose={handleCloseDeleteModal}
          >
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                  <Typography>Are you sure you want to delete your account?</Typography>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleCloseDeleteModal}>Cancel</Button>
                  <Button 
                      onClick={handleDeleteAccount} 
                      color="error"
                      
                  >
                    Delete
                  </Button>
              </DialogActions>
          </Dialog>
      </Container>
    </div>
  );
};

export default Profile;
