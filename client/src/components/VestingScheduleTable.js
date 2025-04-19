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
  if (!project?.vesting) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        No vesting schedule data available.
      </Typography>
    );
  }

  const categories = Object.entries(project.tokenomics.allocation).map(([category, data]) => ({
    name: category,
    percentage: data.percentage,
    amount: data.amount,
    color: data.color || COLORS[Object.keys(project.tokenomics.allocation).indexOf(category) % COLORS.length],
  }));

  const months = Array.from({ length: 60 }, (_, i) => i + 1);

  const calculateVestedAmount = (category, month) => {
    const vesting = project.vesting[category.name];
    if (!vesting) return 0;

    const { tgePercentage, cliffMonths, vestingMonths } = vesting;
    const totalAmount = category.amount;

    if (month === 0) {
      return (totalAmount * tgePercentage) / 100;
    }

    if (month <= cliffMonths) {
      return (totalAmount * tgePercentage) / 100;
    }

    const monthsAfterCliff = month - cliffMonths;
    if (monthsAfterCliff >= vestingMonths) {
      return totalAmount;
    }

    const linearVesting = (totalAmount * (100 - tgePercentage)) / 100;
    const vestedAfterCliff = (linearVesting * monthsAfterCliff) / vestingMonths;
    return (totalAmount * tgePercentage) / 100 + vestedAfterCliff;
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            {categories.map((category) => (
              <TableCell 
                key={category.name} 
                align="right"
                sx={{ 
                  color: category.color,
                  fontWeight: 'bold'
                }}
              >
                {category.name} ({category.percentage}%)
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
              {categories.map((category) => {
                const vestedAmount = calculateVestedAmount(category, month);
                return (
                  <TableCell 
                    key={`${category.name}-${month}`} 
                    align="right"
                    sx={{ color: category.color }}
                  >
                    {vestedAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                );
              })}
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {categories
                  .reduce((total, category) => total + calculateVestedAmount(category, month), 0)
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