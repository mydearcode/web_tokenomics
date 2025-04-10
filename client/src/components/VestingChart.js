import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

const VestingChart = ({ schedules }) => {
  const theme = useTheme();

  if (!schedules || schedules.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No vesting schedules available</Typography>
      </Box>
    );
  }

  // Prepare data for the chart
  const maxMonths = Math.max(...schedules.map(s => s.cliffMonths + s.vestingMonths));
  const chartData = Array.from({ length: maxMonths + 1 }, (_, month) => {
    const monthData = { month };
    
    schedules.forEach(schedule => {
      const {
        category,
        totalTokens,
        tgeAmount,
        remainingTokens,
        monthlyVesting,
        cliffMonths,
        vestingMonths
      } = schedule;

      let currentAmount = tgeAmount;
      
      if (month === 0) {
        monthData[category] = currentAmount;
      } else if (month <= cliffMonths) {
        monthData[category] = currentAmount;
      } else if (month <= cliffMonths + vestingMonths) {
        const monthsSinceCliff = month - cliffMonths;
        currentAmount = tgeAmount + (monthsSinceCliff * monthlyVesting);
        monthData[category] = Math.min(currentAmount, totalTokens);
      } else {
        monthData[category] = totalTokens;
      }
    });

    return monthData;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
            Month {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)} tokens
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ height: 400, mb: 4 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {schedules.map((schedule, index) => (
              <Area
                key={schedule.category}
                type="monotone"
                dataKey={schedule.category}
                stackId="1"
                stroke={theme.palette.primary[`${(index % 5) + 1}00`]}
                fill={theme.palette.primary[`${(index % 5) + 1}00`]}
                fillOpacity={0.6}
                animationBegin={index * 200}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <TableContainer component={Paper} sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>Category</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>Total Tokens</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>TGE (%)</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>TGE Amount</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>Monthly Vesting</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>Cliff (Months)</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>Vesting (Months)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row" sx={{ color: 'text.primary' }}>
                  {schedule.category}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary' }}>
                  {formatNumber(schedule.totalTokens)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary' }}>
                  {schedule.tgePercentage}%
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary' }}>
                  {formatNumber(schedule.tgeAmount)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary' }}>
                  {formatNumber(schedule.monthlyVesting)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary' }}>
                  {schedule.cliffMonths}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary' }}>
                  {schedule.vestingMonths}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VestingChart; 