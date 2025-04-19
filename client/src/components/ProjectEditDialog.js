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
  Box,
} from '@mui/material';

const ProjectEditDialog = ({ open, onClose, onSave, project }) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    tokenName: project.tokenName,
    tokenSymbol: project.tokenSymbol,
    tokenomics: {
      totalSupply: project.tokenomics.totalSupply,
      initialPrice: project.tokenomics.initialPrice,
      maxSupply: project.tokenomics.maxSupply,
      decimals: project.tokenomics.decimals,
      allocation: { ...project.tokenomics.allocation },
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
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Project Information
            </Typography>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={handleChange('name')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Token Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Token Name"
                  value={formData.tokenName}
                  onChange={handleChange('tokenName')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Token Symbol"
                  value={formData.tokenSymbol}
                  onChange={handleChange('tokenSymbol')}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Tokenomics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Supply"
                  type="number"
                  value={formData.tokenomics.totalSupply}
                  onChange={handleChange('tokenomics.totalSupply')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Initial Price ($)"
                  type="number"
                  value={formData.tokenomics.initialPrice}
                  onChange={handleChange('tokenomics.initialPrice')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Supply"
                  type="number"
                  value={formData.tokenomics.maxSupply}
                  onChange={handleChange('tokenomics.maxSupply')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Decimals"
                  type="number"
                  value={formData.tokenomics.decimals}
                  onChange={handleChange('tokenomics.decimals')}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Allocation
            </Typography>
            {Object.entries(formData.tokenomics.allocation).map(([category, data]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Percentage"
                      type="number"
                      value={data.percentage}
                      onChange={handleAllocationChange(category, 'percentage')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={data.amount}
                      onChange={handleAllocationChange(category, 'amount')}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectEditDialog; 