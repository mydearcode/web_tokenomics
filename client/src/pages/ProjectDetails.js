import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProject, getPublicProject, updateProject } from '../services/api';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Lock as LockIcon, Public as PublicIcon } from '@mui/icons-material';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  console.log('ProjectDetails mounted with:', {
    id,
    isAuthenticated,
    user,
    currentPath: window.location.pathname
  });

  // Helper function to check if user can edit the project
  const canEditProject = (project) => {
    if (!isAuthenticated || !user || !project) return false;

    // Check if user is owner
    const isOwner = project.owner && (
      (typeof project.owner === 'string' && project.owner === user.id) ||
      (project.owner._id && project.owner._id === user.id)
    );

    if (isOwner) return true;

    // Check if user is editor
    const isEditor = project.collaborators && project.collaborators.some(c => {
      if (!c || !c.user) return false;
      
      const collabUserId = typeof c.user === 'object' && c.user._id 
        ? c.user._id 
        : c.user;
        
      return collabUserId === user.id && c.role === 'editor';
    });

    return isEditor;
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        console.log('ProjectDetails: Starting to fetch project', {
          id,
          isAuthenticated,
          user,
          currentPath: window.location.pathname
        });
        
        let data;
        if (isAuthenticated) {
          console.log('ProjectDetails: Attempting to fetch as authenticated user...');
          try {
            data = await getProject(id);
            console.log('ProjectDetails: Successfully fetched project as authenticated user:', data);
          } catch (err) {
            console.error('ProjectDetails: Error fetching as authenticated user:', {
              error: err,
              message: err.message,
              response: err.response,
              status: err.response?.status
            });
            if (err.message === 'Authentication required' || err.message === 'You do not have permission to view this project') {
              console.log('ProjectDetails: Attempting to fetch as public project...');
              data = await getPublicProject(id);
              console.log('ProjectDetails: Successfully fetched project as public:', data);
            } else {
              throw err;
            }
          }
        } else {
          console.log('ProjectDetails: Attempting to fetch as public project...');
          data = await getPublicProject(id);
          console.log('ProjectDetails: Successfully fetched project as public:', data);
        }
        
        setProject(data);
        setError(null);
      } catch (err) {
        console.error('ProjectDetails: Error in fetchProject:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          stack: err.stack,
          fullError: err
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      console.log('ProjectDetails: Initiating fetchProject with id:', id);
      fetchProject();
    } else {
      console.error('ProjectDetails: No project ID provided');
      setError('No project ID provided');
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

  const handleEdit = () => {
    if (!isAuthenticated) {
      setError('Please log in to edit this project');
      return;
    }

    if (!canEditProject(project)) {
      setError('You do not have permission to edit this project');
      return;
    }

    setIsEditing(true);
  };

  const handleSave = async (updatedData) => {
    try {
      const updatedProject = await updateProject(id, updatedData);
      setProject({
        ...updatedProject,
        canEdit: () => updatedProject.owner._id === user._id || 
          updatedProject.collaborators?.some(collab => 
            collab.user._id === user._id && collab.role === 'editor'
          )
      });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const updatedProject = await updateProject(id, {
        ...project,
        isPublic: !project.isPublic
      });
      setProject({
        ...updatedProject,
        canEdit: () => updatedProject.owner._id === user._id || 
          updatedProject.collaborators?.some(collab => 
            collab.user._id === user._id && collab.role === 'editor'
          )
      });
    } catch (err) {
      setError('Failed to update project visibility');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
          {!isAuthenticated && error.includes('Authentication required') && (
            <Button
              color="primary"
              variant="contained"
              sx={{ ml: 2 }}
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {project.name}
          </Typography>
          {!isAuthenticated && project.isPrivate && (
            <Box>
              <Alert severity="info">
                This is a private project. Please log in to view it.
                <Button
                  color="primary"
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
              </Alert>
            </Box>
          )}
          <Box>
            {isAuthenticated && canEditProject(project) && (
              <>
                <Tooltip title={project.isPublic ? "Make Private" : "Make Public"}>
                  <IconButton onClick={handleToggleVisibility} color="primary">
                    {project.isPublic ? <PublicIcon /> : <LockIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Project">
                  <IconButton onClick={handleEdit} color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {project.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Token Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Token Name:</strong> {project.tokenName}
              </Typography>
              <Typography variant="body1">
                <strong>Token Symbol:</strong> {project.tokenSymbol}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Tokenomics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Total Supply:</strong> {project.tokenomics.totalSupply.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Initial Price:</strong> ${project.tokenomics.initialPrice}
              </Typography>
              <Typography variant="body1">
                <strong>Max Supply:</strong> {project.tokenomics.maxSupply.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Decimals:</strong> {project.tokenomics.decimals}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Allocation
            </Typography>
            {Object.entries(project.tokenomics.allocation).map(([category, data]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {category}
                </Typography>
                <Typography variant="body1">
                  <strong>Percentage:</strong> {data.percentage}%
                </Typography>
                <Typography variant="body1">
                  <strong>Amount:</strong> {data.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Project Details
          </Typography>
          <Typography variant="body1">
            <strong>Created by:</strong> {project.owner.name}
          </Typography>
          <Typography variant="body1">
            <strong>Visibility:</strong> {project.isPublic ? 'Public' : 'Private'}
          </Typography>
          <Typography variant="body1">
            <strong>Created at:</strong> {new Date(project.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectDetails; 