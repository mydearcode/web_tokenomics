import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { getProject } from '../services/api';
import AllocationChart from '../components/AllocationChart';
import VestingChart from '../components/VestingChart';
import ProjectActions from '../components/ProjectActions';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProject(id);
        setProject(response);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Project not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <ProjectActions project={project} />
        </Box>

        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Token Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Token Name</Typography>
                  <Typography>{project.tokenomics.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Token Symbol</Typography>
                  <Typography>{project.tokenomics.symbol}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Supply</Typography>
                  <Typography>{project.tokenomics.totalSupply.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Initial Price</Typography>
                  <Typography>${project.tokenomics.initialPrice}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Max Supply</Typography>
                  <Typography>{project.tokenomics.maxSupply.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Decimals</Typography>
                  <Typography>{project.tokenomics.decimals}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Token Allocation</Typography>
              <AllocationChart data={project.tokenomics.allocation} />
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(project.tokenomics.allocation).map(([category, data]) => (
                      <TableRow key={category}>
                        <TableCell component="th" scope="row">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </TableCell>
                        <TableCell align="right">
                          {data.amount.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">{data.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Vesting Schedule</Typography>
              <VestingChart 
                allocation={project.tokenomics.allocation} 
                vesting={project.vesting} 
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProjectDetails; 