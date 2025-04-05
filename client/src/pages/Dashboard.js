import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getProjects, deleteProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setProjects(projects.filter(p => p._id !== projectId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  // Helper function to determine project access level
  const getProjectAccess = (project) => {
    if (!user || !project) return 'viewer';
    
    // Check if user is the owner
    const isOwner = project.owner && (
      (typeof project.owner === 'string' && project.owner === user.id) ||
      (project.owner._id && project.owner._id === user.id)
    );
    
    if (isOwner) return 'owner';
    
    // Check if user is an editor
    const isEditor = project.collaborators && project.collaborators.some(c => {
      if (!c || !c.user) return false;
      
      const collabUserId = typeof c.user === 'object' && c.user._id 
        ? c.user._id 
        : c.user;
        
      return collabUserId === user.id && c.role === 'editor';
    });
    
    if (isEditor) return 'editor';
    
    return 'viewer';
  };

  useEffect(() => {
    const fetchProjects = async () => {
      console.log('Dashboard: Fetching projects...');
      try {
        const response = await getProjects();
        console.log('Dashboard: Projects fetched successfully:', response);
        setProjects(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard: Error fetching projects:', err);
        // If the error is due to no projects, show a friendly message
        if (err.response?.status === 404) {
          setError('No projects found. Create your first project to get started!');
        } else {
          setError('Unable to load projects. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Projects
        </Typography>
        <Button
          component={RouterLink}
          to="/projects/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              You haven't created any projects yet.
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                component={RouterLink}
                to="/projects/create"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Create Your First Project
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => {
            const accessLevel = getProjectAccess(project);
            return (
              <Grid item key={project._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/projects/${project._id}`}
                      size="small"
                      startIcon={<ViewIcon />}
                    >
                      View
                    </Button>
                    
                    {/* Edit button - only for owner and editor */}
                    {(accessLevel === 'owner' || accessLevel === 'editor') && (
                      <Button
                        component={RouterLink}
                        to={`/projects/${project._id}/edit`}
                        size="small"
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                    )}
                    
                    {/* Delete button - only for owner */}
                    {accessLevel === 'owner' && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(project._id)}
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 