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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        setProjects(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tokenomics.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Projects
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
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              {searchTerm
                ? 'No projects found matching your search'
                : "You haven't created any projects yet."}
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                component={RouterLink}
                to="/projects/create"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Create New Project
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item key={project._id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      {project.name}
                    </Typography>
                    {project.isPublic ? (
                      <PublicIcon color="action" />
                    ) : (
                      <LockIcon color="action" />
                    )}
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {project.description || 'No description provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Token: {project.tokenomics.tokenSymbol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Supply:{' '}
                    {project.tokenomics.totalSupply.toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/projects/${project._id}`}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/projects/${project._id}/edit`}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectList; 