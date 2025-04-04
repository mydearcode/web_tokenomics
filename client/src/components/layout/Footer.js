import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Tokenomics Web. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="#"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Terms
            </Link>
            <Link
              href="#"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Privacy
            </Link>
            <Link
              href="#"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 