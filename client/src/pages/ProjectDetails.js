import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { getProject, getPublicProject } from '../services/api';
import AllocationChart from '../components/AllocationChart';
import VestingScheduleChart from '../components/VestingScheduleChart';
import ProjectActions from '../components/ProjectActions';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        let response;
        // If user is logged in, try authenticated route first
        if (user) {
          try {
            response = await getProject(id);
            setProject(response);
            setLoading(false);
            return;
          } catch (err) {
            console.log('Authenticated route failed, trying public route...');
          }
        }
        
        // Try public route
        try {
          response = await getPublicProject(id);
          setProject(response);
        } catch (err) {
          if (user) {
            throw new Error('You do not have access to this project.');
          } else {
            throw new Error('This project is not public. Please login to view it.');
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/project/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({
        open: true,
        message: 'Project URL copied to clipboard!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to copy URL',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        {!user && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Login to View
          </Button>
        )}
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          sx={{ mt: 2, ml: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Project not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleShare}
              disabled={!project.isPublic}
            >
              Share Project
            </Button>
            {user && <ProjectActions project={project} />}
          </Box>
        </Box>

        {!project.isPublic && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This project is private. Only you can view it.
          </Alert>
        )}

        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Token Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Token Name</Typography>
                  <Typography>{project.tokenName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Token Symbol</Typography>
                  <Typography>{project.tokenSymbol}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Supply</Typography>
                  <Typography>{project.tokenomics.totalSupply.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Initial Price</Typography>
                  <Typography>${project.tokenomics.initialPrice}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Max Supply</Typography>
                  <Typography>{project.tokenomics.maxSupply.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Decimals</Typography>
                  <Typography>{project.tokenomics.decimals}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Token Allocation</Typography>
              <AllocationChart data={project.tokenomics.allocation} />
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                      <TableCell align="center">Vesting Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(project.tokenomics.allocation).map(([category, data]) => {
                      const vestingInfo = project.vesting[category] || {};
                      return (
                        <TableRow key={category}>
                          <TableCell component="th" scope="row">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </TableCell>
                          <TableCell align="right">
                            {data.amount.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">{data.percentage}%</TableCell>
                          <TableCell align="center">
                            {vestingInfo.tgePercentage !== undefined ? (
                              `(TGE: ${vestingInfo.tgePercentage}% - Cliff: ${vestingInfo.cliffMonths} months - Vesting: ${vestingInfo.vestingMonths} months)`
                            ) : (
                              'No vesting schedule'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <VestingScheduleChart project={project} />
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectDetails; 