import React from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const FormError = ({ error, touched }) => {
  if (!error || !touched) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: 'error.main',
        mt: 0.5,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} />
      <Typography variant="caption">{error}</Typography>
    </Box>
  );
};

export default FormError; 