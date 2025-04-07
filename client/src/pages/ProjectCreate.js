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
    tokenomics: {
      totalSupply: '',
      initialPrice: '',
      maxSupply: '',
      decimals: '18'
    },
    allocation: {},
    vesting: {}
  });

  const [allocationCategories, setAllocationCategories] = useState([
    'Team',
    'Advisors',
    'Marketing',
    'Development',
    'Community',
    'Reserve',
    'Liquidity'
  ]);

  const [selectedCategory, setSelectedCategory] = useState('Team');

  useEffect(() => {
    // Initialize allocation and vesting data for each category
    const initialAllocation = {};
    const initialVesting = {};

    allocationCategories.forEach(category => {
      initialAllocation[category] = 0;
      initialVesting[category] = {
        tgePercentage: 0,
        cliffMonths: 0,
        vestingMonths: 0
      };
    });

    setFormData(prev => ({
      ...prev,
      allocation: initialAllocation,
      vesting: initialVesting
    }));
  }, [allocationCategories]);

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
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation,
        [selectedCategory]: Number(value)
      }
    }));
  };

  const handleVestingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vesting: {
        ...prev.vesting,
        [selectedCategory]: {
          ...prev.vesting[selectedCategory],
          [name]: Number(value)
        }
      }
    }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const calculateTotalAllocation = () => {
    return Object.values(formData.allocation).reduce((sum, value) => sum + Number(value), 0);
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
      if (!tokenomics.totalSupply || !tokenomics.initialPrice || !tokenomics.maxSupply || !tokenomics.decimals) {
        throw new Error('Please fill in all tokenomics fields');
      }

      // Validate allocation total
      const totalAllocation = calculateTotalAllocation();
      if (Math.abs(totalAllocation - 100) > 0.01) {
        throw new Error(`Total allocation must be 100%. Current total: ${totalAllocation}%`);
      }

      // Validate vesting data
      for (const [category, vesting] of Object.entries(formData.vesting)) {
        if (!vesting.tgePercentage || !vesting.cliffMonths || !vesting.vestingMonths) {
          throw new Error(`Please fill in all vesting fields for ${category}`);
        }
      }

      const projectData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        tokenomics: {
          totalSupply: Number(formData.tokenomics.totalSupply),
          initialPrice: Number(formData.tokenomics.initialPrice),
          maxSupply: Number(formData.tokenomics.maxSupply),
          decimals: Number(formData.tokenomics.decimals),
          allocation: formData.allocation
        },
        vesting: formData.vesting
      };
      
      console.log('Submitting project data:', projectData);
      await createProject(projectData);
      
      // Add a small delay before navigating to ensure the project is saved
      setTimeout(() => {
        navigate('/projects');
      }, 500);
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.message || 'Failed to create project. Please try again.');
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
      // Vesting aylarını cliff sonrasından başlat ama doğru ay numarasını kullan
      const month = Number(vestingData.cliffMonths) + i;
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Token Name"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Token Symbol"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Project Description"
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
                label="Public Project"
              />
            </Grid>

            {/* Tokenomics */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tokenomics
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Total Supply"
                name="totalSupply"
                value={formData.tokenomics.totalSupply}
                onChange={handleTokenomicsChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Initial Price"
                name="initialPrice"
                value={formData.tokenomics.initialPrice}
                onChange={handleTokenomicsChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Max Supply"
                name="maxSupply"
                value={formData.tokenomics.maxSupply}
                onChange={handleTokenomicsChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Decimals"
                name="decimals"
                value={formData.tokenomics.decimals}
                onChange={handleTokenomicsChange}
              />
            </Grid>

            {/* Allocation */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Token Allocation
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Allocation: {calculateTotalAllocation()}%
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {allocationCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Allocation Percentage"
                value={formData.allocation[selectedCategory]}
                onChange={handleAllocationChange}
              />
            </Grid>

            {/* Vesting */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Vesting Schedule - {selectedCategory}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="TGE Percentage"
                name="tgePercentage"
                value={formData.vesting[selectedCategory]?.tgePercentage}
                onChange={handleVestingChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Cliff Months"
                name="cliffMonths"
                value={formData.vesting[selectedCategory]?.cliffMonths}
                onChange={handleVestingChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Vesting Months"
                name="vestingMonths"
                value={formData.vesting[selectedCategory]?.vestingMonths}
                onChange={handleVestingChange}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </Button>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default ProjectCreate; 