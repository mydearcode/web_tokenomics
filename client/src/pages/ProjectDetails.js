import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getProject, deleteProject } from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVestingCategory, setSelectedVestingCategory] = useState('team');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete project');
        console.error('Error deleting project:', err);
      }
    }
  };

  // Vesting hesaplama fonksiyonu
  const calculateVestingSchedule = (category) => {
    if (!project?.vesting?.[category]) return [];
    
    const vestingData = project.vesting[category];
    const allocation = project.tokenomics?.allocation?.[category]?.percentage || 0;
    const tgeAmount = (allocation * vestingData.tgePercentage) / 100;
    const remainingAmount = allocation - tgeAmount;
    const monthlyVesting = remainingAmount / vestingData.vestingMonths;
    
    const schedule = [];
    
    // TGE anındaki miktar
    schedule.push({
      month: 0,
      percentage: vestingData.tgePercentage,
      amount: tgeAmount
    });
    
    // Cliff süresi sonrası vesting
    for (let i = 1; i <= vestingData.vestingMonths; i++) {
      const month = vestingData.cliffMonths + i;
      const percentage = (vestingData.tgePercentage + (i * (100 - vestingData.tgePercentage) / vestingData.vestingMonths)).toFixed(2);
      const amount = tgeAmount + (monthlyVesting * i);
      
      schedule.push({
        month,
        percentage: parseFloat(percentage),
        amount: parseFloat(amount.toFixed(2))
      });
    }
    
    return schedule;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Project not found</Alert>
      </Container>
    );
  }

  const isOwner = user && project.userId === user.id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {project.isPublic ? (
                <PublicIcon color="action" />
              ) : (
                <LockIcon color="action" />
              )}
              <Typography variant="body2" color="text.secondary">
                {project.isPublic ? 'Public Project' : 'Private Project'}
              </Typography>
            </Box>
          </Box>
          {isOwner && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  console.log('Navigating to edit page for project:', id);
                  navigate(`/projects/${id}/edit`);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Token Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Token Name
            </Typography>
            <Typography variant="body1">{project.tokenomics?.tokenName || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Token Symbol
            </Typography>
            <Typography variant="body1">{project.tokenomics?.tokenSymbol || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Supply
            </Typography>
            <Typography variant="body1">
              {project.tokenomics?.totalSupply ? project.tokenomics.totalSupply.toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom>
          Token Allocation
        </Typography>
        <Grid container spacing={2}>
          {project.tokenomics?.allocation ? Object.entries(project.tokenomics.allocation).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {value.percentage}%
                </Typography>
              </Paper>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Alert severity="info">No allocation data available</Alert>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Vesting Schedule
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={selectedVestingCategory}
            onChange={(e, newValue) => setSelectedVestingCategory(newValue)}
          >
            {['team', 'advisors', 'partners'].map((category) => (
              <Tab
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                value={category}
              />
            ))}
          </Tabs>
        </Box>

        {project?.vesting?.[selectedVestingCategory] ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculateVestingSchedule(selectedVestingCategory).map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>M{row.month}</TableCell>
                    <TableCell align="right">{row.percentage}%</TableCell>
                    <TableCell align="right">{row.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No vesting schedule available for this category.</Alert>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectDetails; 