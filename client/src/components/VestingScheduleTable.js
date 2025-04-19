import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const COLORS = [
  '#FF6384', // Red
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#C9CBCF', // Gray
  '#00A86B', // Green
];

const VestingScheduleTable = ({ project }) => {
  if (!project?.vesting?.categories) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        No vesting schedule data available.
      </Typography>
    );
  }

  const { vesting, tokenomics } = project;
  const { categories } = vesting;

  const calculateVestedAmount = (category, month) => {
    const { percentage, amount, startMonth, vestingPeriod } = category;
    const totalAmount = amount || (tokenomics.totalSupply * percentage) / 100;

    if (month < startMonth) return 0;
    if (month >= startMonth + vestingPeriod) return totalAmount;

    const vestedMonths = month - startMonth;
    return (totalAmount * vestedMonths) / vestingPeriod;
  };

  const months = Array.from({ length: 60 }, (_, i) => i + 1);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            {Object.entries(categories).map(([category, details], index) => (
              <TableCell 
                key={category} 
                align="right"
                sx={{ 
                  color: COLORS[index % COLORS.length],
                  fontWeight: 'bold'
                }}
              >
                {category} ({details.percentage}%)
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Vested</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {months.map((month) => (
            <TableRow key={month}>
              <TableCell component="th" scope="row">
                {month}
              </TableCell>
              {Object.entries(categories).map(([category, details], index) => {
                const vestedAmount = calculateVestedAmount(details, month);
                return (
                  <TableCell 
                    key={category} 
                    align="right"
                    sx={{ color: COLORS[index % COLORS.length] }}
                  >
                    {vestedAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                );
              })}
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {Object.entries(categories)
                  .reduce((total, [_, details]) => total + calculateVestedAmount(details, month), 0)
                  .toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VestingScheduleTable; 