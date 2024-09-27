import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  // State to store screen width
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if screen width is less than 450px
  const isSmallScreen = screenWidth < 650;

  // Define styles based on screen width
  const cardStyles = {
    width: isSmallScreen ? '100%' : '30rem',
    cursor: 'pointer',
    borderRadius: '0.375rem',
    boxShadow: isSmallScreen ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.2)', // Add shadow for larger screens
    marginLeft: '-10px'
  };

  const imgStyles = {
    borderRadius: '20px',
    padding: '8px',
    width: '100%',
    height: isSmallScreen ? '200px' : '300px', // Adjust height for small screens
    objectFit: 'cover', // Ensure image covers the area without distortion
    marginBottom: '-10px' 
  };

  const shouldTruncate = event.description && event.description.length > 0;

  const textStyles = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: shouldTruncate ? 2 : 'unset', // Allow more lines on larger screens
    fontWeight: 'light',
    fontSize: isSmallScreen ? '0.8rem' : '0.9rem', // Adjust font size
    marginTop: '-10px',
  };

  const titleStyles = {
    fontWeight: 'bold',
    fontSize: isSmallScreen ? '1.2rem' : '1.5rem',
  };

  const handleClick = () => {
    navigate(`/event/${encodeURIComponent(event.name)}`, { state: { event } });
  };

  const readableDate = dayjs(event.datetime).format('MMMM D, YYYY h:mm A');

  return (
    <Card style={cardStyles} onClick={handleClick}>
      <Card.Img variant="top" src={event.image} alt={event.name} style={imgStyles} />
      <Card.Body>
        <Card.Title style={titleStyles}>{event.name}</Card.Title>
        <Card.Text style={textStyles}>
          {event.description}
        </Card.Text>
        <Card.Text>
          <small style={textStyles} className="text-muted">{readableDate}</small>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default EventCard;
