import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteProject } from '../services/api';

const ProjectActions = ({ project }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
    handleMenuClose();
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/projects/${project._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(project._id);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
    handleMenuClose();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projects/${project._id}`;
    navigator.clipboard.writeText(url);
    handleShareClose();
  };

  return (
    <Box>
      <IconButton
        onClick={handleMenuClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main
          }
        }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ 
          '&:hover': { 
            background: alpha(theme.palette.primary.main, 0.1) 
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Edit Project</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShareClick} sx={{ 
          '&:hover': { 
            background: alpha(theme.palette.primary.main, 0.1) 
          }
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Share Project</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ 
          '&:hover': { 
            background: alpha(theme.palette.error.main, 0.1) 
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>Delete Project</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={handleCopyLink} sx={{ 
          '&:hover': { 
            background: alpha(theme.palette.primary.main, 0.1) 
          }
        }}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectActions; 