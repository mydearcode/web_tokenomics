import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { getProject } from '../services/api';
import AllocationChart from '../components/AllocationChart';
import VestingChart from '../components/VestingChart';
import ProjectActions from '../components/ProjectActions';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allocationCategories, setAllocationCategories] = useState([]);
  const [vestingSchedules, setVestingSchedules] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        if (!data) {
          setError('Project not found');
          return;
        }
        setProject(data);
        
        // Set allocation data directly from project data
        setAllocationCategories(data);

        // Calculate vesting schedules
        if (data.tokenomics?.allocation && data.vesting) {
          const schedules = calculateVestingSchedule(data);
          setVestingSchedules(schedules);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const calculateVestingSchedule = (projectData) => {
    if (!projectData.tokenomics?.allocation || !projectData.vesting) return [];

    return Object.entries(projectData.tokenomics.allocation).map(([category, allocation]) => {
      const vestingData = projectData.vesting[category];
      if (!vestingData) return null;

      const totalTokens = allocation.amount;
      const tgeAmount = (totalTokens * vestingData.tgePercentage) / 100;
      const remainingTokens = totalTokens - tgeAmount;
      const monthlyVesting = vestingData.vestingMonths > 0 ? remainingTokens / vestingData.vestingMonths : 0;

      return {
        category,
        totalTokens,
        tgeAmount,
        remainingTokens,
        monthlyVesting,
        cliffMonths: vestingData.cliffMonths,
        vestingMonths: vestingData.vestingMonths,
        tgePercentage: vestingData.tgePercentage
      };
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        background: `linear-gradient(45deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error
        </Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(45deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {project.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {project.description}
              </Typography>
            </Box>
            <ProjectActions project={project} />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                  Token Allocation
                </Typography>
                <Box sx={{ height: 400 }}>
                  <AllocationChart data={project.tokenomics} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                  Token Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Token Name</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {project.tokenName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Token Symbol</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {project.tokenSymbol || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Supply</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {project.tokenomics?.totalSupply?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Initial Price</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      ${project.tokenomics?.initialPrice?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Max Supply</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {project.tokenomics?.maxSupply?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Decimals</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {project.tokenomics?.decimals || '18'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                  Vesting Schedule
                </Typography>
                <VestingChart schedules={vestingSchedules} />
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProjectDetails; 