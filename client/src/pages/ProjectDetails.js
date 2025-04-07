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
  Share as ShareIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getProject, deleteProject } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import ShareProject from '../components/ShareProject';
import AllocationChart from '../components/AllocationChart';
import VestingChart from '../components/VestingChart';
import ProjectActions from '../components/ProjectActions';

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectAccess, setProjectAccess] = useState('none');
  const [allocationCategories, setAllocationCategories] = useState([]);
  const [vestingSchedules, setVestingSchedules] = useState([]);
  const [selectedVestingCategory, setSelectedVestingCategory] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await getProject(id);
        
        if (!projectData) {
          setError('Project not found');
          return;
        }

        setProject(projectData);
        
        // Determine project access
        if (projectData.owner._id === user?._id) {
          setProjectAccess('owner');
        } else if (projectData.collaborators?.some(c => c.user._id === user?._id)) {
          setProjectAccess('collaborator');
        } else if (projectData.isPublic) {
          setProjectAccess('public');
        }

        // Calculate vesting schedules
        if (projectData.tokenomics && projectData.vesting) {
          const schedules = calculateVestingSchedule(projectData);
          setVestingSchedules(schedules);
        }

        // Prepare allocation data for visualization
        if (projectData.tokenomics?.allocation) {
          const categories = prepareAllocationData(projectData.tokenomics.allocation);
          setAllocationCategories(categories);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const calculateVestingSchedule = (projectData) => {
    const schedules = [];
    const { totalSupply } = projectData.tokenomics;
    const allocation = projectData.tokenomics.allocation;
    const vesting = projectData.vesting;

    Object.entries(allocation).forEach(([category, percentage]) => {
      const vestingData = vesting[category];
      if (vestingData) {
        const totalTokens = (totalSupply * percentage) / 100;
        const tgeAmount = (totalTokens * vestingData.tgePercentage) / 100;
        const remainingTokens = totalTokens - tgeAmount;
        const monthlyVesting = remainingTokens / vestingData.vestingMonths;

        const schedule = {
          category,
          totalTokens,
          tgeAmount,
          remainingTokens,
          monthlyVesting,
          cliffMonths: vestingData.cliffMonths,
          vestingMonths: vestingData.vestingMonths
        };

        schedules.push(schedule);
      }
    });

    return schedules;
  };

  const prepareAllocationData = (allocation) => {
    return Object.entries(allocation).map(([category, percentage]) => ({
      name: category,
      value: percentage
    }));
  };

  const handleShareProject = () => {
    setShareDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={3}>
        <Alert severity="info">Project not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {project.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Created by {project.owner.name} on {new Date(project.createdAt).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Token Information
            </Typography>
            <Typography>
              Name: {project.tokenName}
            </Typography>
            <Typography>
              Symbol: {project.tokenSymbol}
            </Typography>
            <Typography>
              Total Supply: {project.tokenomics?.totalSupply?.toLocaleString() || '0'}
            </Typography>
            <Typography>
              Initial Price: ${project.tokenomics?.initialPrice?.toLocaleString() || '0'}
            </Typography>
            <Typography>
              Max Supply: {project.tokenomics?.maxSupply?.toLocaleString() || '0'}
            </Typography>
            <Typography>
              Decimals: {project.tokenomics?.decimals || '0'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Allocation
            </Typography>
            <AllocationChart data={allocationCategories} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vesting Schedule
            </Typography>
            <VestingChart schedules={vestingSchedules} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <ProjectActions
            project={project}
            access={projectAccess}
            onEdit={() => navigate(`/projects/${id}/edit`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetails; 