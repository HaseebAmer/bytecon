import React, {useEffect} from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Hidden from '@mui/material/Hidden';
import { useNavigate } from 'react-router-dom';
import bg from '../components/background-2.png';
import '../fonts/ArchivoBlack-Regular.css';
import '../fonts/redhat.css';

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
	const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));


  const options = [
    { label: 'Login', path: '/login' },
    { label: 'Signup', path: '/signup' }
  ];

  const ITEM_HEIGHT = 48;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
        document.body.style.overflow = 'auto';
    };
  }, []);


  return (
    <div>
      <Box style={{
        fontFamily: 'ArchivoBlack-Regular',
        marginTop: '20px',
        marginLeft: isLargeScreen ? '0%' : '13%',
        fontSize:  isLargeScreen ? '3rem' : '6rem',
        color: '#0288d1',
				textAlign: isLargeScreen ? 'center' : 'left'
      }}
        data-testid="logo-name"
      >
        BYTECON
      </Box>
			
			<Box
       sx={{
				backgroundColor: 'clear',
				padding: 2,
				width: '100%',
				textAlign: 'center', 
				display: 'flex',
				flexDirection: 'column',
				alignItems: isLargeScreen ? 'center' : 'flex-start', 
				justifyContent: isLargeScreen ? 'center' : 'flex-start',
				marginLeft: isLargeScreen ? '0%' : '13%',
			}}
      >
				<Typography variant="h5"
					sx={{
						color: '#0288d1',
						fontFamily: 'redhat',
						marginTop: isLargeScreen ? '50px' : '75px',
						marginBottom: 5,
						fontSize: isLargeScreen ? '2rem' : '3rem',
						fontWeight: 'bold'
						
					}}
          data-testid="sub-heading"
					>
						Find and manage all your events in one place.
				</Typography>


				<Typography
					variant="body1"
					sx={{
						color: 'black',
						fontFamily: 'redhat',
						fontWeight: 'medium',
						lineHeight: 1.4,
						fontSize: isMediumScreen ? '1rem' : '110%',
						wordWrap: 'break-word', 
						width: isMediumScreen ? '80%' : '45%',
						textAlign: isMediumScreen ? 'center' : 'left',
					}}
          data-testid="description"
				>
					Discover, organize, and participate in top-tier conferences all in one place. 
					Streamline your event experience and stay connected with the latest 
					advancements and networking opportunities in CS.
				</Typography>

				<Button
					variant="contained"
					size="large"
					disableElevation
                    onClick={() => navigate('/signup')}
					sx={{
						textTransform: 'none',
						fontFamily: 'sans-serif',
						borderRadius: '40px',
						width: '200px',
						marginTop: '20px',
						fontWeight: 'bold',
						fontSize: '20px',
						padding: '10 0 0 0',
					}}
          data-testid="find-event-button"
				>
					Find an event
				</Button>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: 16,
          display: 'flex',
          gap: 2
        }}
      >
        <Hidden lgDown={isLargeScreen}>
          <Button
            variant="text"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              textTransform: 'none',
              fontFamily: 'sans-serif',
              borderRadius: '100px',
              width: '200px',
              marginTop: '70px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
            data-testid="login-button"
          >
            Login
          </Button>
        </Hidden>

        <Hidden lgDown={isLargeScreen}>
          <Button
            variant="contained"
            size="large"
            disableElevation
            onClick={() => navigate('/signup')}
            sx={{
              textTransform: 'none',
              fontFamily: 'sans-serif',
              borderRadius: '40px',
              width: '200px',
              marginTop: '70px',
              marginRight: '50%',
              fontWeight: 'bold',
            }}
            data-testid="signup-button"
          >
            Signup
          </Button>
        </Hidden>

        <Hidden lgUp={!isLargeScreen}>
          <IconButton
            aria-label="more"
            aria-controls={open ? 'simple-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
            sx={{
              textTransform: 'none',
              fontFamily: 'sans-serif',
              borderRadius: '40px',
              width: '100px',
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Hidden>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '8ch',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: 'none', 
            },
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.label}
              onClick={() => handleMenuItemClick(option.path)}
              sx={{
                color: '#0288d1',
                fontWeight: 'medium',
                '&:hover': {
                  color: '#0288d1', 
                  border: '1px solid #0288d1', 
                  borderRadius: '8px', 
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
			<Hidden lgDown={isLargeScreen}>
      <div style={{ 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh', 
    background: 'transparent' 
}}>
    <img
        src={bg}
        alt="background"
        style={{
            width: isLargeScreen ? '50%' : '70%',
            height: 'auto',
            marginBottom: '500px' 
        }}
    />
</div>


			</Hidden>
    </div>
  );
}

