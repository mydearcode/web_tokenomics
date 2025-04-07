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

  // Dialog state
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
          tokenName: projectData.tokenName || '',
          tokenSymbol: projectData.tokenSymbol || '',
          tokenomics: {
            totalSupply: projectData.tokenomics?.totalSupply?.toString() || '',
            initialPrice: projectData.tokenomics?.initialPrice?.toString() || '',
            maxSupply: projectData.tokenomics?.maxSupply?.toString() || '',
            decimals: projectData.tokenomics?.decimals?.toString() || '18'
          },
          allocation: projectData.tokenomics?.allocation || {},
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

  const handleAddCategory = () => {
    setNewCategoryName('');
    setOpenCategoryDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenCategoryDialog(false);
  };
  
  const handleAddCategoryConfirm = () => {
    if (newCategoryName && !formData.allocation[newCategoryName]) {
      setAllocationCategories([...allocationCategories, newCategoryName]);
      setFormData(prev => ({
        ...prev,
        allocation: {
          ...prev.allocation,
          [newCategoryName]: 0
        },
        vesting: {
          ...prev.vesting,
          [newCategoryName]: {
            tgePercentage: 10,
            cliffMonths: 6,
            vestingMonths: 12
          }
        }
      }));
      
      // Log the updated form data
      console.log('Added category:', newCategoryName);
      console.log('Updated form data:', {
        allocation: { ...formData.allocation, [newCategoryName]: 0 },
        vesting: { 
          ...formData.vesting, 
          [newCategoryName]: {
            tgePercentage: 10,
            cliffMonths: 6,
            vestingMonths: 12
          }
        }
      });
    }
    
    handleCloseDialog();
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
      const totalAllocation = Object.values(formData.allocation).reduce((sum, value) => sum + Number(value), 0);
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
      await updateProject(id, projectData);
      
      // Add a small delay before navigating to ensure the project is saved
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 500);
    } catch (err) {
      console.error('Project update error:', err);
      setError(err.message || 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Vesting hesaplama fonksiyonu
  const calculateVestingSchedule = (category) => {
    const vestingData = formData.vesting[category];
    const allocation = formData.allocation[category];
    const totalTokens = (Number(formData.tokenomics.totalSupply) * allocation) / 100;
    
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
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Project
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
                {loading ? 'Updating Project...' : 'Update Project'}
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
      
      {/* Add Category Dialog */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Add Token Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a name for the new token allocation category
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Category Name"
            type="text"
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCategoryConfirm();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddCategoryConfirm} 
            color="primary"
            variant="contained"
            disabled={!newCategoryName.trim()}
          >
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectEdit; 