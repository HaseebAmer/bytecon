import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const ImageComponent = ({ imageUrl, onImageUpload, editable }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imageUrl) {
      setImageSrc(imageUrl);
    }
  }, [imageUrl]);

  const handleClick = () => {
    if (editable) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageSrc(reader.result);
        if (onImageUpload) {
          onImageUpload(file);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      data-testid="image-component"
      sx={{
        position: 'relative',
        width: '100%',
        height: {
          xs: '150px', 
          sm: '200px',
          md: '250px', 
          lg: '300px', 
          xl: '350px', 
        },
        bgcolor: '#e6e6e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: imageSrc ? `url(${imageSrc})` : 'none',
        border: '2px solid #e6e6e6',
        marginTop: 2,
        cursor: editable ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />
      {!imageSrc && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '1.5rem',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: '2rem', mb: 1 }} />
          <div>Add an image here</div>
        </Box>
      )}
    </Box>
  );
};

export default ImageComponent;
