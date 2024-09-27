import React from 'react';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// Custom styled button
const RoundButton = styled(Button)({
    minWidth: 0,
    width: 40,
    height: 40,
    borderRadius: '50%',
    color: 'white',
    backgroundColor: 'rgb(24,118,209)',
    '&:hover': {
        backgroundColor: 'rgb(24,118,209)',
    }
});


export default function XButtonField() {
    return (
        <div>
            <RoundButton>
                <CloseIcon />
            </RoundButton>
        </div>
    );
}
