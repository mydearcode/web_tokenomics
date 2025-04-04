import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import axios from 'axios';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tokenomics: {
      blockchain: 'Ethereum',
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: 18,
      totalSupply: '',
      maxSupply: '',
      allocation: {
        team: { percentage: 0, vestingPeriod: 0, cliff: 0 },
        advisors: { percentage: 0, vestingPeriod: 0, cliff: 0 },
        investors: { percentage: 0, vestingPeriod: 0, cliff: 0 },
        community: { percentage: 0, vestingPeriod: 0, cliff: 0 },
        treasury: { percentage: 0, vestingPeriod: 0, cliff: 0 },
        marketing: { percentage: 0, vestingPeriod: 0, cliff: 0 },
        liquidity: { percentage: 0, vestingPeriod: 0, cliff: 0 },
      },
      tokenSale: {
        fundraisingAmount: 0,
        tokenType: '',
        acceptedCurrencies: [],
        preSeedRoundDate: null,
        seedRoundDate: null,
        privateRoundDate: null,
        publicRoundDate: null,
        initialExchangeListingDate: null,
      },
      features: {
        transactionFee: { enabled: false, percentage: 0 },
        mintFunction: { enabled: false },
        burnFunction: { enabled: false },
      },
    },
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'isPublic') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTokenomicsChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tokenomics: {
        ...prev.tokenomics,
        [section]: {
          ...prev.tokenomics[section],
          [field]: value,
        },
      },
    }));
  };

  const handleAllocationChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tokenomics: {
        ...prev.tokenomics,
        allocation: {
          ...prev.tokenomics.allocation,
          [category]: {
            ...prev.tokenomics.allocation[category],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/projects', formData);
      navigate(`/projects/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Project
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <TextField
                required
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={handleChange}
                    name="isPublic"
                  />
                }
                label="Make project public"
              />
            </Grid>

            {/* Token Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Token Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Token Name"
                    value={formData.tokenomics.tokenName}
                    onChange={(e) =>
                      handleTokenomicsChange('tokenName', '', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Token Symbol"
                    value={formData.tokenomics.tokenSymbol}
                    onChange={(e) =>
                      handleTokenomicsChange('tokenSymbol', '', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Total Supply"
                    type="number"
                    value={formData.tokenomics.totalSupply}
                    onChange={(e) =>
                      handleTokenomicsChange('totalSupply', '', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Supply"
                    type="number"
                    value={formData.tokenomics.maxSupply}
                    onChange={(e) =>
                      handleTokenomicsChange('maxSupply', '', e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Allocation */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Token Allocation
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(formData.tokenomics.allocation).map(
                  ([category, data]) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                        <TextField
                          fullWidth
                          label="Percentage"
                          type="number"
                          value={data.percentage}
                          onChange={(e) =>
                            handleAllocationChange(
                              category,
                              'percentage',
                              parseFloat(e.target.value)
                            )
                          }
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Vesting Period (months)"
                          type="number"
                          value={data.vestingPeriod}
                          onChange={(e) =>
                            handleAllocationChange(
                              category,
                              'vestingPeriod',
                              parseInt(e.target.value)
                            )
                          }
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Cliff (months)"
                          type="number"
                          value={data.cliff}
                          onChange={(e) =>
                            handleAllocationChange(
                              category,
                              'cliff',
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Paper>
                    </Grid>
                  )
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Create Project
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectCreate; 