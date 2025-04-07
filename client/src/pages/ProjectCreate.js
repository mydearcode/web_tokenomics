import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AllocationChart from '../components/AllocationChart';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    const schedule = [];
    const totalSupply = Number(formData.tokenomics.totalSupply) || 0;

    Object.entries(formData.tokenomics.allocation).forEach(([category, allocation]) => {
      const vesting = formData.vesting[category] || { tgePercentage: 0, cliffMonths: 0, vestingMonths: 0 };
      const totalTokens = (allocation.percentage / 100) * totalSupply;
      const tgeAmount = (vesting.tgePercentage / 100) * totalTokens;
      const remainingTokens = totalTokens - tgeAmount;
      
      if (vesting.vestingMonths > 0 || tgeAmount > 0) {
        schedule.push({
          category,
          allocation: allocation.percentage,
          tge: vesting.tgePercentage,
          cliff: vesting.cliffMonths,
          vesting: vesting.vestingMonths,
          schedule: calculateSchedule(totalTokens, vesting)
        });
      }
    });

    setVestingSchedule(schedule);
  }, [formData.tokenomics.allocation, formData.vesting, formData.tokenomics.totalSupply]);

  const calculateSchedule = (totalTokens, vesting) => {
    const schedule = [];
    const tgeAmount = (vesting.tgePercentage / 100) * totalTokens;
    const remainingTokens = totalTokens - tgeAmount;
    
    if (vesting.vestingMonths > 0) {
      const monthlyAmount = remainingTokens / vesting.vestingMonths;
      let currentAmount = tgeAmount;

      for (let month = 0; month <= vesting.vestingMonths + vesting.cliffMonths; month++) {
        if (month === 0 && tgeAmount > 0) {
          schedule.push({
            month,
            amount: tgeAmount,
            totalAmount: currentAmount
          });
        } else if (month > vesting.cliffMonths) {
          currentAmount += monthlyAmount;
          schedule.push({
            month,
            amount: monthlyAmount,
            totalAmount: currentAmount
          });
        }
      }
    } else if (tgeAmount > 0) {
      schedule.push({
        month: 0,
        amount: tgeAmount,
        totalAmount: tgeAmount
      });
    }
    
    return schedule;
  };

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

  const handleAddCategory = () => {
    if (newCategory && !allocationCategories.includes(newCategory)) {
      const formattedCategory = newCategory.trim();
      const categoryKey = formattedCategory.toLowerCase();
      
      // Keep existing allocation and vesting data
      setAllocationCategories(prev => [...prev, formattedCategory]);
      setSelectedCategory(formattedCategory);
      
      // Only initialize the new category
      setFormData(prev => ({
        ...prev,
        tokenomics: {
          ...prev.tokenomics,
          allocation: {
            ...prev.tokenomics.allocation,
            [categoryKey]: {
              percentage: 0,
              amount: 0
            }
          }
        },
        vesting: {
          ...prev.vesting,
          [categoryKey]: {
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

  const calculateTotalAllocation = () => {
    return Object.values(formData.tokenomics.allocation)
      .reduce((sum, { percentage }) => sum + Number(percentage), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name?.trim() || !formData.description?.trim()) {
        throw new Error('Please fill in project name and description');
      }

      // Validate tokenomics data
      const tokenomics = formData.tokenomics;
      if (!tokenomics.name?.trim()) {
        throw new Error('Token name is required');
      }
      if (!tokenomics.symbol?.trim()) {
        throw new Error('Token symbol is required');
      }
      if (!tokenomics.totalSupply || Number(tokenomics.totalSupply) <= 0) {
        throw new Error('Total supply must be greater than 0');
      }
      if (!tokenomics.initialPrice || Number(tokenomics.initialPrice) <= 0) {
        throw new Error('Initial price must be greater than 0');
      }
      if (!tokenomics.maxSupply || Number(tokenomics.maxSupply) <= 0) {
        throw new Error('Max supply must be greater than 0');
      }
      if (!tokenomics.decimals || Number(tokenomics.decimals) < 0 || Number(tokenomics.decimals) > 18) {
        throw new Error('Decimals must be between 0 and 18');
      }

      // Validate allocation total
      const totalAllocation = calculateTotalAllocation();
      if (Math.abs(totalAllocation - 100) > 0.01) {
        throw new Error(`Total allocation must be 100%. Current total: ${totalAllocation}%`);
      }

      // Prepare project data
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPublic: formData.isPublic,
        tokenomics: {
          name: tokenomics.name.trim(),
          symbol: tokenomics.symbol.trim(),
          totalSupply: Number(tokenomics.totalSupply),
          initialPrice: Number(tokenomics.initialPrice),
          maxSupply: Number(tokenomics.maxSupply),
          decimals: Number(tokenomics.decimals),
          allocation: Object.entries(formData.tokenomics.allocation).reduce((acc, [key, value]) => {
            if (value.percentage > 0) {
              acc[key] = {
                percentage: Number(value.percentage),
                amount: Number(value.amount)
              };
            }
            return acc;
          }, {})
        },
        vesting: Object.entries(formData.vesting).reduce((acc, [key, value]) => {
          if (formData.tokenomics.allocation[key]?.percentage > 0) {
            acc[key] = {
              tgePercentage: Number(value.tgePercentage || 0),
              cliffMonths: Number(value.cliffMonths || 0),
              vestingMonths: Number(value.vestingMonths || 0)
            };
          }
          return acc;
        }, {})
      };

      // Log the data being sent
      console.log('Submitting project data:', JSON.stringify(projectData, null, 2));

      const response = await createProject(projectData);
      if (response?.data?._id) {
        navigate(`/projects/${response.data._id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Project
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
              {vestingSchedule.map((categoryData, index) => (
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
                          {categoryData.schedule.map((item, scheduleIndex) => (
                            <TableRow key={`${categoryData.category}-${item.month}-${scheduleIndex}`}>
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
              {loading ? <CircularProgress size={24} /> : 'Create Project'}
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

export default ProjectCreate; 