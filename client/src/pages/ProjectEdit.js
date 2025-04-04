import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { getProject, updateProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [projectAccess, setProjectAccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    allocation: {},
    vesting: {}
  });

  const [allocationCategories, setAllocationCategories] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await getProject(id);
        const projectData = response.data || response;
        
        console.log('Fetched project:', projectData);
        setProject(projectData);
        
        // Determine project access level
        let accessLevel = 'viewer';
        if (user && projectData.owner && projectData.owner._id === user.id) {
          accessLevel = 'owner';
        } else if (projectData.collaborators && projectData.collaborators.some(c => c.user && c.user._id === user?.id && c.role === 'editor')) {
          accessLevel = 'editor';
        }
        setProjectAccess(accessLevel);
        
        // If user doesn't have edit access, redirect to details page
        if (accessLevel !== 'owner' && accessLevel !== 'editor') {
          console.log('User does not have edit access, redirecting...');
          navigate(`/projects/${id}`);
          return;
        }
        
        // Get allocation categories from project data
        const categories = Object.keys(projectData.tokenomics?.allocation || {});
        setAllocationCategories(categories);
        
        // Transform project data to form data
        const transformedData = {
          name: projectData.name || '',
          description: projectData.description || '',
          isPublic: projectData.isPublic || false,
          tokenName: projectData.tokenomics?.tokenName || '',
          tokenSymbol: projectData.tokenomics?.tokenSymbol || '',
          totalSupply: projectData.tokenomics?.totalSupply?.toString() || '',
          allocation: {},
          vesting: {}
        };
        
        // Process allocation data
        if (projectData.tokenomics?.allocation) {
          Object.entries(projectData.tokenomics.allocation).forEach(([key, value]) => {
            transformedData.allocation[key] = value.percentage || 0;
          });
        }
        
        // Process vesting data
        if (projectData.vesting) {
          Object.entries(projectData.vesting).forEach(([key, value]) => {
            transformedData.vesting[key] = {
              tgePercentage: value?.tgePercentage ?? 10,
              cliffMonths: value?.cliffMonths ?? 6,
              vestingMonths: value?.vestingMonths ?? 12
            };
          });
        }
        
        setFormData(transformedData);
        console.log('Transformed form data:', transformedData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTokenomicsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      tokenomics: {
        ...prev.tokenomics,
        [name]: value
      }
    }));
  };

  const handleAllocationChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation,
        [category]: value
      }
    }));
  };

  const handleVestingChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      vesting: {
        ...prev.vesting,
        [category]: {
          ...prev.vesting[category],
          [field]: value
        }
      }
    }));
  };

  const handleAddCategory = () => {
    const categoryName = prompt('Enter category name:');
    if (categoryName && !formData.allocation[categoryName]) {
      setAllocationCategories([...allocationCategories, categoryName]);
      setFormData(prev => ({
        ...prev,
        allocation: {
          ...prev.allocation,
          [categoryName]: 0
        },
        vesting: {
          ...prev.vesting,
          [categoryName]: {
            tgePercentage: 10,
            cliffMonths: 6,
            vestingMonths: 12
          }
        }
      }));
      
      // Log the updated form data
      console.log('Added category:', categoryName);
      console.log('Updated form data:', {
        allocation: { ...formData.allocation, [categoryName]: 0 },
        vesting: { 
          ...formData.vesting, 
          [categoryName]: {
            tgePercentage: 10,
            cliffMonths: 6,
            vestingMonths: 12
          }
        }
      });
    }
  };

  const handleRemoveCategory = (category) => {
    const newCategories = allocationCategories.filter(c => c !== category);
    setAllocationCategories(newCategories);
    
    const newAllocation = { ...formData.allocation };
    delete newAllocation[category];
    
    const newVesting = { ...formData.vesting };
    delete newVesting[category];
    
    setFormData(prev => ({
      ...prev,
      allocation: newAllocation,
      vesting: newVesting
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate total allocation
      const totalAllocation = Object.values(formData.allocation).reduce((sum, value) => sum + Number(value), 0);
      
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
          totalSupply: Number(formData.totalSupply),
          allocation: Object.fromEntries(
            Object.entries(formData.allocation).map(([key, value]) => [
              key,
              {
                percentage: Number(value),
                amount: (Number(formData.totalSupply) * Number(value)) / 100
              }
            ])
          )
        },
        vesting: Object.fromEntries(
          Object.entries(formData.vesting).map(([key, value]) => [
            key,
            {
              tgePercentage: Number(value.tgePercentage),
              cliffMonths: Number(value.cliffMonths),
              vestingMonths: Number(value.vestingMonths)
            }
          ])
        )
      };
      
      await updateProject(id, projectData);
      
      // Add a small delay before navigating to ensure the project is saved
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Vesting hesaplama fonksiyonu
  const calculateVestingSchedule = (category) => {
    const vestingData = formData.vesting[category];
    const allocation = formData.allocation[category];
    const totalTokens = (Number(formData.totalSupply) * allocation) / 100;
    
    // TGE anında açılacak miktar (M0)
    const tgeAmount = (totalTokens * vestingData.tgePercentage) / 100;
    const remainingAmount = totalTokens - tgeAmount;
    
    // Kalan miktar vesting aylarına bölünecek
    const monthlyVesting = remainingAmount / vestingData.vestingMonths;
    
    const schedule = [];
    
    // M0 (TGE)
    schedule.push({
      month: 0,
      monthDisplay: "M0",
      percentage: vestingData.tgePercentage,
      amount: tgeAmount
    });
    
    // Cliff dönemi (TGE dahil)
    // TGE zaten M0'da olduğu için, cliff süresini 1 azaltıyoruz
    for (let i = 1; i < vestingData.cliffMonths; i++) {
      schedule.push({
        month: i,
        monthDisplay: `M${i}`,
        percentage: vestingData.tgePercentage,
        amount: 0
      });
    }
    
    // Vesting dönemi
    let releasedAmount = tgeAmount; // TGE'de açılan miktar
    for (let i = 0; i < vestingData.vestingMonths; i++) {
      const month = vestingData.cliffMonths + i;
      releasedAmount += monthlyVesting; // Her ay eşit miktar ekle
      const percentage = (releasedAmount / totalTokens) * 100;
      
      schedule.push({
        month: month,
        monthDisplay: `M${month}`,
        percentage: parseFloat(percentage.toFixed(2)),
        amount: parseFloat(releasedAmount.toFixed(2))
      });
    }
    
    // Ayları sayısal olarak sırala
    schedule.sort((a, b) => a.month - b.month);
    
    return schedule;
  };

  if (loading && !formData.name) {
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Project
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
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
                  onChange={handleTokenomicsChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="tokenSymbol"
                  label="Token Symbol"
                  value={formData.tokenSymbol}
                  onChange={handleTokenomicsChange}
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
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Token Allocation (%)</Typography>
                  <Button variant="outlined" onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </Box>
                {allocationCategories.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Click "Add Category" to add token allocation categories
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {allocationCategories.map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            fullWidth
                            type="number"
                            name={`allocation.${category}`}
                            label={category.charAt(0).toUpperCase() + category.slice(1)}
                            value={formData.allocation[category]}
                            onChange={(e) => handleAllocationChange(category, e.target.value)}
                            required
                          />
                          <Button
                            color="error"
                            onClick={() => handleRemoveCategory(category)}
                            sx={{ minWidth: 'auto' }}
                          >
                            X
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Vesting Schedule
                  </Typography>
                  {allocationCategories.length === 0 ? (
                    <Alert severity="info">
                      Add allocation categories to configure vesting schedules
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {allocationCategories.map((category) => (
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
                                  value={formData.vesting[category]?.tgePercentage || 0}
                                  onChange={(e) => handleVestingChange(category, 'tgePercentage', e.target.value)}
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
                                  value={formData.vesting[category]?.cliffMonths || 6}
                                  onChange={(e) => handleVestingChange(category, 'cliffMonths', e.target.value)}
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
                                  value={formData.vesting[category]?.vestingMonths || 12}
                                  onChange={(e) => handleVestingChange(category, 'vestingMonths', e.target.value)}
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
                                        <TableCell>{row.monthDisplay}</TableCell>
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
                  )}
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
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Update Project'
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

export default ProjectEdit; 