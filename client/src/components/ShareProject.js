import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import { addProjectCollaborator, removeProjectCollaborator } from '../services/api';

const ShareProject = ({ project, open, onClose, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Debug project data
  useEffect(() => {
    if (project) {
      console.log("ShareProject - Project data:", project);
      console.log("ShareProject - Collaborators:", project.collaborators);
      
      // Check if owner and collaborators are populated correctly
      if (project.owner) {
        console.log("ShareProject - Owner:", project.owner);
      } else {
        console.warn("ShareProject - Owner is not populated:", project.owner);
      }
      
      if (project.collaborators && project.collaborators.length > 0) {
        project.collaborators.forEach((collab, index) => {
          console.log(`ShareProject - Collaborator ${index}:`, collab);
          if (!collab.user || !collab.user.name) {
            console.warn(`ShareProject - Collaborator ${index} user is not properly populated:`, collab.user);
          }
        });
      }
    }
  }, [project]);
  
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Attempting to add collaborator: ${email} with role: ${role}`);
      const result = await addProjectCollaborator(project._id, email, role);
      console.log('Add collaborator result:', result);
      
      setEmail('');
      setSuccessMessage(`${email} adresine davet gönderildi`);
      
      // Refresh project data
      if (typeof onUpdate === 'function') {
        await onUpdate();
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      
      // Display user-friendly error message
      if (error.message) {
        setError(error.message);
      } else if (typeof error === 'string') {
        setError(error);
      } else {
        setError('Kullanıcı eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      // Log detailed information if available
      if (error.details) {
        console.error("Detailed error info:", error.details);
        
        // If we have server stack trace in development, log it
        if (error.details.stack) {
          console.error("Server stack trace:", error.details.stack);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveCollaborator = async (userId) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await removeProjectCollaborator(project._id, userId);
      setSuccessMessage('Collaborator removed');
      
      // Refresh project data
      if (typeof onUpdate === 'function') {
        await onUpdate();
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      setError(error.message || 'Failed to remove collaborator');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <ShareIcon sx={{ mr: 1 }} />
            Share Project
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {project?.name}
          </Typography>
          
          <Box component="form" onSubmit={handleAddCollaborator} sx={{ mt: 2, mb: 3 }}>
            <Box display="flex" alignItems="flex-start" gap={1}>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !email}
              >
                Share
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            People with access
          </Typography>
          
          <List>
            {/* Owner */}
            <ListItem>
              <ListItemText
                primary={project?.owner?.name || 'Owner'}
                secondary={project?.owner?.email || 'Owner Email'}
              />
              <ListItemSecondaryAction>
                <Typography variant="body2" color="textSecondary">
                  Owner
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
            
            {/* Collaborators */}
            {project?.collaborators && project.collaborators.length > 0 ? (
              project.collaborators.map((collab) => (
                <ListItem key={collab.user?._id || 'temp-key'}>
                  <ListItemText
                    primary={collab.user?.name || 'Unknown User'}
                    secondary={collab.user?.email || 'No email available'}
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                        {collab.role === 'editor' ? 'Editor' : 'Viewer'}
                      </Typography>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveCollaborator(collab.user?._id)}
                        disabled={loading || !collab.user?._id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  secondary="No collaborators yet"
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={!!error || !!successMessage} 
        autoHideDuration={6000} 
        onClose={() => {
          setError('');
          setSuccessMessage('');
        }}
      >
        <Alert 
          onClose={() => {
            setError('');
            setSuccessMessage('');
          }} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareProject; 