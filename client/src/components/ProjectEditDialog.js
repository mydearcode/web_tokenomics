import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
} from '@mui/material';

const ProjectEditDialog = ({ open, onClose, onSave, project }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    tokenName: project?.tokenName || '',
    tokenSymbol: project?.tokenSymbol || '',
    tokenomics: {
      totalSupply: project?.tokenomics?.totalSupply || 0,
      initialPrice: project?.tokenomics?.initialPrice || 0,
      maxSupply: project?.tokenomics?.maxSupply || 0,
      decimals: project?.tokenomics?.decimals || 18,
      allocation: project?.tokenomics?.allocation || {},
    },
  });

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAllocationChange = (category, field) => (event) => {
    const value = field === 'percentage' ? Number(event.target.value) : event.target.value;
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

  const handleSubmit = () => {
    // Validate total allocation percentage
    const totalPercentage = Object.values(formData.tokenomics.allocation)
      .reduce((sum, { percentage }) => sum + Number(percentage), 0);
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert('Total allocation percentage must equal 100%');
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Token Name"
              value={formData.tokenName}
              onChange={handleChange('tokenName')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Token Symbol"
              value={formData.tokenSymbol}
              onChange={handleChange('tokenSymbol')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Total Supply"
              type="number"
              value={formData.tokenomics.totalSupply}
              onChange={handleChange('tokenomics.totalSupply')}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Initial Price ($)"
              type="number"
              value={formData.tokenomics.initialPrice}
              onChange={handleChange('tokenomics.initialPrice')}
              inputProps={{ min: 0, step: 0.000001 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Supply"
              type="number"
              value={formData.tokenomics.maxSupply}
              onChange={handleChange('tokenomics.maxSupply')}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Decimals"
              type="number"
              value={formData.tokenomics.decimals}
              onChange={handleChange('tokenomics.decimals')}
              inputProps={{ min: 0, max: 18 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Token Allocation
            </Typography>
            {Object.entries(formData.tokenomics.allocation).map(([category, data]) => (
              <Grid container spacing={2} key={category} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">{category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Percentage"
                    type="number"
                    value={data.percentage}
                    onChange={handleAllocationChange(category, 'percentage')}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={data.amount}
                    onChange={handleAllocationChange(category, 'amount')}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectEditDialog; 