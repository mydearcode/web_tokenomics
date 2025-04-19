import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProject, updateProject, toggleProjectVisibility } from '../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ProjectEditDialog from '../components/ProjectEditDialog';
import TokenAllocationChart from '../components/charts/TokenAllocationChart';
import VestingScheduleChart from '../components/VestingScheduleChart';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProject = async () => {
    try {
      console.log('Fetching project with ID:', id);
      const data = await getProject(id);
      console.log('Received project data:', data);
      setProject(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching project:', err);
      if (err.message === 'Authentication required') {
        navigate('/login', { state: { from: `/projects/${id}` } });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData) => {
    try {
      setLoading(true);
      await updateProject(id, updatedData);
      await fetchProject();
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setLoading(true);
      await toggleProjectVisibility(id);
      await fetchProject();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Project not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {project.name}
          </Typography>
          {user && (user._id === project.owner._id) && (
            <Box>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={project.isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
                variant="outlined"
                onClick={handleToggleVisibility}
              >
                {project.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
            </Box>
          )}
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
              Token Allocation
            </Typography>
            <Box sx={{ mb: 4 }}>
              <TokenAllocationChart allocation={project.tokenomics.allocation} />
            </Box>
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

      {project && (
        <ProjectEditDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSave}
          project={project}
        />
      )}
    </Container>
  );
};

export default ProjectDetails; 