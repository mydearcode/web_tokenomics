import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { createProject } from '../services/api';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    allocation: {
      team: 20,
      marketing: 15,
      development: 20,
      liquidity: 15,
      treasury: 10,
      community: 10,
      advisors: 5,
      partners: 5
    },
    vesting: {
      team: {
        tgePercentage: 10,
        cliffMonths: 6,
        vestingMonths: 12
      },
      advisors: {
        tgePercentage: 0,
        cliffMonths: 6,
        vestingMonths: 12
      },
      partners: {
        tgePercentage: 0,
        cliffMonths: 6,
        vestingMonths: 12
      }
    }
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    console.log('Field changed:', name, value, checked);
    
    if (name === 'isPublic') {
      setFormData({ ...formData, [name]: checked });
    } else if (name.startsWith('allocation.')) {
      const allocationKey = name.split('.')[1];
      const numValue = value === '' ? 0 : Number(value);
      console.log('Allocation changed:', allocationKey, numValue);
      
      setFormData({
        ...formData,
        allocation: {
          ...formData.allocation,
          [allocationKey]: numValue,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    console.log('Form submitted with values:', formData);
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate total allocation
      const totalAllocation = Object.values(formData.allocation).reduce((sum, value) => sum + Number(value), 0);
      console.log('Total allocation:', totalAllocation);
      
      if (Math.abs(totalAllocation - 100) > 0.01) {
        setError(`Total allocation must equal 100%. Current total: ${totalAllocation}%`);
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.description || !formData.tokenName || !formData.tokenSymbol || !formData.totalSupply) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate total supply
      const totalSupply = Number(formData.totalSupply);
      if (isNaN(totalSupply) || totalSupply <= 0) {
        setError('Total supply must be a positive number');
        setLoading(false);
        return;
      }

      // Prepare project data
      const projectData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        tokenomics: {
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          totalSupply: Number(totalSupply),
          allocation: {
            team: {
              percentage: Number(formData.allocation.team) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            marketing: {
              percentage: Number(formData.allocation.marketing) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            development: {
              percentage: Number(formData.allocation.development) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            liquidity: {
              percentage: Number(formData.allocation.liquidity) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            treasury: {
              percentage: Number(formData.allocation.treasury) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            community: {
              percentage: Number(formData.allocation.community) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            advisors: {
              percentage: Number(formData.allocation.advisors) || 0,
              vestingPeriod: 0,
              cliff: 0
            },
            partners: {
              percentage: Number(formData.allocation.partners) || 0,
              vestingPeriod: 0,
              cliff: 0
            }
          }
        }
      };
      
      // Log the exact data being sent
      console.log('Raw form data:', formData);
      console.log('Allocation values before conversion:', formData.allocation);
      console.log('Allocation values after conversion:', projectData.tokenomics.allocation);
      console.log('Creating project with data:', JSON.stringify(projectData, null, 2));
      
      const response = await createProject(projectData);
      
      console.log('Project created successfully:', response);
      
      // Add a small delay before navigating to ensure the project is saved
      console.log('Navigating to dashboard...');
      setTimeout(() => {
        console.log('Navigation timeout completed, redirecting to dashboard');
        navigate('/');
      }, 500);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Vesting hesaplama fonksiyonu
  const calculateVestingSchedule = (category) => {
    const vestingData = formData.vesting[category];
    const allocation = formData.allocation[category];
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Project Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Project Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Public Project"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="tokenName"
                  label="Token Name"
                  value={formData.tokenName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="tokenSymbol"
                  label="Token Symbol"
                  value={formData.tokenSymbol}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  name="totalSupply"
                  label="Total Supply"
                  value={formData.totalSupply}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Token Allocation (%)
                </Typography>
                <Grid container spacing={2}>
                  {Object.keys(formData.allocation).map((key) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <TextField
                        fullWidth
                        type="number"
                        name={`allocation.${key}`}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={formData.allocation[key]}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Vesting Schedule
                  </Typography>
                  <Grid container spacing={3}>
                    {['team', 'advisors', 'partners'].map((category) => (
                      <Grid item xs={12} key={category}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {category.charAt(0).toUpperCase() + category.slice(1)} Vesting
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="TGE Percentage"
                                type="number"
                                value={formData.vesting[category].tgePercentage}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setFormData(prev => ({
                                    ...prev,
                                    vesting: {
                                      ...prev.vesting,
                                      [category]: {
                                        ...prev.vesting[category],
                                        tgePercentage: value
                                      }
                                    }
                                  }));
                                }}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Cliff Months"
                                type="number"
                                value={formData.vesting[category].cliffMonths}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setFormData(prev => ({
                                    ...prev,
                                    vesting: {
                                      ...prev.vesting,
                                      [category]: {
                                        ...prev.vesting[category],
                                        cliffMonths: value
                                      }
                                    }
                                  }));
                                }}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">months</InputAdornment>,
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Vesting Months"
                                type="number"
                                value={formData.vesting[category].vestingMonths}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setFormData(prev => ({
                                    ...prev,
                                    vesting: {
                                      ...prev.vesting,
                                      [category]: {
                                        ...prev.vesting[category],
                                        vestingMonths: value
                                      }
                                    }
                                  }));
                                }}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">months</InputAdornment>,
                                }}
                              />
                            </Grid>
                          </Grid>
                          
                          {/* Vesting Schedule Preview */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Vesting Schedule Preview
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Month</TableCell>
                                    <TableCell align="right">Percentage</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {calculateVestingSchedule(category).map((row) => (
                                    <TableRow key={row.month}>
                                      <TableCell>M{row.month}</TableCell>
                                      <TableCell align="right">{row.percentage}%</TableCell>
                                      <TableCell align="right">{row.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                  onClick={(e) => {
                    // Prevent default form submission
                    e.preventDefault();
                    // Call handleSubmit manually
                    handleSubmit(e);
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectCreate; 