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

const VestingScheduleTable = ({ project }) => {
  const { vesting, tokenomics } = project;
  const { cliff, duration, categories } = vesting;

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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            {Object.entries(categories).map(([category, details]) => (
              <TableCell key={category} align="right">
                {category}
              </TableCell>
            ))}
            <TableCell align="right">Total Vested</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {months.map((month) => (
            <TableRow key={month}>
              <TableCell component="th" scope="row">
                {month}
              </TableCell>
              {Object.entries(categories).map(([category, details]) => {
                const vestedAmount = calculateVestedAmount(details, month);
                return (
                  <TableCell key={category} align="right">
                    {vestedAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                );
              })}
              <TableCell align="right">
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