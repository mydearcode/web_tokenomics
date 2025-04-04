import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import axios from 'axios';
import TokenAllocationChart from '../components/charts/TokenAllocationChart';

// ... existing code ...

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Token Allocation
              </Typography>
              <TokenAllocationChart
                allocation={project.tokenomics.allocation}
              />
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
                    {Object.entries(project.tokenomics.allocation).map(
                      ([category, amount]) => {
                        const total = Object.values(
                          project.tokenomics.allocation
                        ).reduce((a, b) => a + b, 0);
                        const percentage = ((amount / total) * 100).toFixed(1);
                        return (
                          <TableRow key={category}>
                            <TableCell component="th" scope="row">
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </TableCell>
                            <TableCell align="right">
                              {amount.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

// ... existing code ... 