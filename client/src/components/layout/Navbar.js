import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Tokenomics Web
        </Typography>
        
        {user ? (
          <>
            {isMobile ? (
              <>
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMobileMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchorEl}
                  open={Boolean(mobileMenuAnchorEl)}
                  onClose={handleMobileMenuClose}
                  PaperProps={{
                    sx: { width: 220, mt: 1.5 },
                  }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/"
                    onClick={handleMobileMenuClose}
                    selected={isActive('/')}
                  >
                    <DashboardIcon sx={{ mr: 2 }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/projects/create"
                    onClick={handleMobileMenuClose}
                  >
                    <AddIcon sx={{ mr: 2 }} />
                    New Project
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={handleMobileMenuClose}
                    selected={isActive('/profile')}
                  >
                    <PersonIcon sx={{ mr: 2 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/"
                    color="inherit"
                    sx={{
                      mx: 1,
                      fontWeight: isActive('/') ? 700 : 400,
                      borderBottom: isActive('/') ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      borderRadius: 0,
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/projects/create"
                    color="inherit"
                    startIcon={<AddIcon />}
                    sx={{ mx: 1 }}
                  >
                    New Project
                  </Button>
                </Box>
                
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                    }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    sx: { width: 220, mt: 1.5 },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    selected={isActive('/profile')}
                  >
                    <PersonIcon sx={{ mr: 2 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </>
        ) : (
          <Box>
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              sx={{ mx: 1 }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="primary"
              sx={{ mx: 1 }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 