import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VestingChart = ({ schedules }) => {
  if (!schedules || schedules.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No vesting schedules available</Typography>
      </Box>
    );
  }

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <Box>
      <Box sx={{ height: 400, mb: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={schedules}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Area type="monotone" dataKey="totalTokens" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Total Tokens</TableCell>
              <TableCell align="right">TGE Amount</TableCell>
              <TableCell align="right">Remaining Tokens</TableCell>
              <TableCell align="right">Monthly Vesting</TableCell>
              <TableCell align="right">Cliff Months</TableCell>
              <TableCell align="right">Vesting Months</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {schedule.category}
                </TableCell>
                <TableCell align="right">{formatNumber(schedule.totalTokens)}</TableCell>
                <TableCell align="right">{formatNumber(schedule.tgeAmount)}</TableCell>
                <TableCell align="right">{formatNumber(schedule.remainingTokens)}</TableCell>
                <TableCell align="right">{formatNumber(schedule.monthlyVesting)}</TableCell>
                <TableCell align="right">{schedule.cliffMonths}</TableCell>
                <TableCell align="right">{schedule.vestingMonths}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VestingChart; 