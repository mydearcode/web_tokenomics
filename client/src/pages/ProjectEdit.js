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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { getProject, updateProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AllocationChart from '../components/AllocationChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [projectAccess, setProjectAccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tokenomics: {
      name: '',
      symbol: '',
      totalSupply: '',
      initialPrice: '',
      maxSupply: '',
      decimals: '18',
      allocation: {}
    },
    vesting: {}
  });

  const [allocationCategories, setAllocationCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [vestingSchedule, setVestingSchedule] = useState([]);

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
        
        // Update allocation categories from existing data
        const existingCategories = Object.keys(projectData.tokenomics?.allocation || {}).map(
          category => category.charAt(0).toUpperCase() + category.slice(1)
        );
        setAllocationCategories(existingCategories);
        if (existingCategories.length > 0) {
          setSelectedCategory(existingCategories[0]);
        }
        
        // Transform project data to form data
        const transformedData = {
          name: projectData.name || '',
          description: projectData.description || '',
          isPublic: projectData.isPublic || false,
          tokenName: projectData.tokenName || '',
          tokenSymbol: projectData.tokenSymbol || '',
          tokenomics: {
            name: projectData.tokenName || '',
            symbol: projectData.tokenSymbol || '',
            totalSupply: projectData.tokenomics?.totalSupply?.toString() || '',
            initialPrice: projectData.tokenomics?.initialPrice?.toString() || '',
            maxSupply: projectData.tokenomics?.maxSupply?.toString() || '',
            decimals: projectData.tokenomics?.decimals?.toString() || '18',
            allocation: projectData.tokenomics?.allocation || {}
          },
          vesting: projectData.vesting || {}
        };
        
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

  const calculateVestingSchedule = () => {
    if (!formData.tokenomics.allocation || !formData.vesting) return [];
    
    return Object.entries(formData.tokenomics.allocation).map(([category, allocation]) => {
      const vestingInfo = formData.vesting[category];
      if (!vestingInfo) return null;
      
      const { percentage, amount } = allocation;
      const { tgePercentage, cliffMonths, vestingMonths } = vestingInfo;
      
      // Calculate schedule for this category
      const schedule = [];
      let totalVested = 0;
      
      // TGE (Token Generation Event)
      if (tgePercentage > 0) {
        const tgeAmount = (amount * tgePercentage) / 100;
        totalVested += tgeAmount;
        schedule.push({
          month: 0,
          amount: tgeAmount,
          totalAmount: totalVested
        });
      }
      
      // During cliff period
      for (let month = 1; month <= cliffMonths; month++) {
        schedule.push({
          month,
          amount: 0,
          totalAmount: totalVested
        });
      }
      
      // After cliff period
      const remainingAmount = amount - totalVested;
      const remainingMonths = vestingMonths;
      const monthlyAmount = remainingAmount / remainingMonths;
      
      for (let month = cliffMonths + 1; month <= cliffMonths + vestingMonths; month++) {
        totalVested += monthlyAmount;
        schedule.push({
          month,
          amount: monthlyAmount,
          totalAmount: totalVested
        });
      }
      
      return {
        category,
        allocation: percentage,
        tge: tgePercentage,
        cliff: cliffMonths,
        vesting: vestingMonths,
        schedule
      };
    }).filter(Boolean);
  };

  // Update vestingSchedule when formData changes
  useEffect(() => {
    const newSchedule = calculateVestingSchedule();
    setVestingSchedule(newSchedule);
  }, [formData.tokenomics.allocation, formData.vesting]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleAllocationChange = (e) => {
    if (!selectedCategory) return;
    
    const categoryKey = selectedCategory.toLowerCase();
    const value = e.target.value;
    const numValue = Number(value) || 0;
    const totalSupply = Number(formData.tokenomics.totalSupply) || 0;
    
    setFormData(prev => ({
      ...prev,
      tokenomics: {
        ...prev.tokenomics,
        allocation: {
          ...prev.tokenomics.allocation,
          [categoryKey]: {
            percentage: numValue,
            amount: (numValue / 100) * totalSupply
          }
        }
      }
    }));
  };

  const handleVestingChange = (field, value) => {
    if (!selectedCategory) return;
    
    const categoryKey = selectedCategory.toLowerCase();
    const numValue = Number(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      vesting: {
        ...prev.vesting,
        [categoryKey]: {
          ...prev.vesting[categoryKey],
          [field]: numValue
        }
      }
    }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const calculateTotalAllocation = () => {
    return Object.values(formData.tokenomics.allocation)
      .reduce((sum, { percentage }) => sum + Number(percentage), 0);
  };

  const handleAddCategory = () => {
    if (newCategory && !allocationCategories.includes(newCategory)) {
      const formattedCategory = newCategory.trim();
      setAllocationCategories(prev => [...prev, formattedCategory]);
      setSelectedCategory(formattedCategory);
      
      // Initialize allocation and vesting data for new category
      setFormData(prev => ({
        ...prev,
        tokenomics: {
          ...prev.tokenomics,
          allocation: {
            ...prev.tokenomics.allocation,
            [formattedCategory.toLowerCase()]: {
              percentage: 0,
              amount: 0
            }
          }
        },
        vesting: {
          ...prev.vesting,
          [formattedCategory.toLowerCase()]: {
            tgePercentage: 0,
            cliffMonths: 0,
            vestingMonths: 0
          }
        }
      }));
      
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      // Validate tokenomics data
      const tokenomics = formData.tokenomics;
      if (!tokenomics.name || !tokenomics.symbol || !tokenomics.totalSupply || 
          !tokenomics.initialPrice || !tokenomics.maxSupply || !tokenomics.decimals) {
        throw new Error('Please fill in all tokenomics fields');
      }

      // Validate allocation total
      const totalAllocation = calculateTotalAllocation();
      if (Math.abs(totalAllocation - 100) > 0.01) {
        throw new Error(`Total allocation must be 100%. Current total: ${totalAllocation}%`);
      }

      const projectData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        tokenomics: {
          name: tokenomics.name,
          symbol: tokenomics.symbol,
          totalSupply: Number(tokenomics.totalSupply),
          initialPrice: Number(tokenomics.initialPrice),
          maxSupply: Number(tokenomics.maxSupply),
          decimals: Number(tokenomics.decimals),
          allocation: Object.entries(formData.tokenomics.allocation).reduce((acc, [key, value]) => {
            acc[key] = {
              percentage: Number(value.percentage),
              amount: Number(value.amount)
            };
            return acc;
          }, {})
        },
        vesting: Object.entries(formData.vesting).reduce((acc, [key, value]) => {
          acc[key] = {
            tgePercentage: Number(value.tgePercentage),
            cliffMonths: Number(value.cliffMonths),
            vestingMonths: Number(value.vestingMonths)
          };
          return acc;
        }, {})
      };

      console.log('Submitting project data:', projectData);
      await updateProject(id, projectData);
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Project update error:', err);
      setError(err.message || 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Project
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      name="isPublic"
                    />
                  }
                  label="Make project public"
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Token Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Token Name"
                  name="name"
                  value={formData.tokenomics.name}
                  onChange={handleTokenomicsChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Token Symbol"
                  name="symbol"
                  value={formData.tokenomics.symbol}
                  onChange={handleTokenomicsChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Total Supply"
                  name="totalSupply"
                  value={formData.tokenomics.totalSupply}
                  onChange={handleTokenomicsChange}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Initial Price"
                  name="initialPrice"
                  value={formData.tokenomics.initialPrice}
                  onChange={handleTokenomicsChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.000001 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Max Supply"
                  name="maxSupply"
                  value={formData.tokenomics.maxSupply}
                  onChange={handleTokenomicsChange}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Decimals"
                  name="decimals"
                  value={formData.tokenomics.decimals}
                  onChange={handleTokenomicsChange}
                  InputProps={{
                    inputProps: { min: 0, max: 18 }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Token Allocation</Typography>
              <Button variant="outlined" onClick={() => setShowAddCategory(true)}>
                Add Category
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    label="Category"
                  >
                    {allocationCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="number"
                  label="Allocation Percentage"
                  value={formData.tokenomics.allocation[selectedCategory.toLowerCase()]?.percentage || 0}
                  onChange={handleAllocationChange}
                  sx={{ mt: 2 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 }
                  }}
                />

                <Typography variant="subtitle2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Amount: {formData.tokenomics.allocation[selectedCategory.toLowerCase()]?.amount.toLocaleString()} tokens
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Vesting Schedule
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    label="TGE Percentage"
                    name="tgePercentage"
                    value={formData.vesting[selectedCategory.toLowerCase()]?.tgePercentage || 0}
                    onChange={(e) => handleVestingChange('tgePercentage', e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100 }
                    }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Cliff (months)"
                    name="cliffMonths"
                    value={formData.vesting[selectedCategory.toLowerCase()]?.cliffMonths || 0}
                    onChange={(e) => handleVestingChange('cliffMonths', e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Vesting Period (months)"
                    name="vestingMonths"
                    value={formData.vesting[selectedCategory.toLowerCase()]?.vestingMonths || 0}
                    onChange={(e) => handleVestingChange('vestingMonths', e.target.value)}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Allocation Preview
                  </Typography>
                  <AllocationChart data={formData.tokenomics.allocation} />
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(formData.tokenomics.allocation).map(([category, data]) => (
                        <TableRow key={category}>
                          <TableCell>{category.charAt(0).toUpperCase() + category.slice(1)}</TableCell>
                          <TableCell align="right">{data.percentage}%</TableCell>
                          <TableCell align="right">{data.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{calculateTotalAllocation()}%</strong></TableCell>
                        <TableCell align="right">
                          <strong>
                            {Object.values(formData.tokenomics.allocation)
                              .reduce((sum, { amount }) => sum + amount, 0)
                              .toLocaleString()}
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>

          {vestingSchedule.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Vesting Schedule Preview
              </Typography>
              {vestingSchedule.map((categoryData) => (
                <Accordion key={categoryData.category}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {categoryData.category.charAt(0).toUpperCase() + categoryData.category.slice(1)} 
                      ({categoryData.allocation}% - TGE: {categoryData.tge}% - 
                      Cliff: {categoryData.cliff} months - Vesting: {categoryData.vesting} months)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryData.schedule.map((item, index) => (
                            <TableRow key={`${categoryData.category}-${item.month}-${index}`}>
                              <TableCell>{item.month}</TableCell>
                              <TableCell align="right">
                                {item.amount.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                {item.totalAmount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </form>

        <Dialog open={showAddCategory} onClose={() => setShowAddCategory(false)}>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProjectEdit; 