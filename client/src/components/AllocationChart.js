import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

const AllocationChart = ({ data }) => {
  const theme = useTheme();

  if (!data || !data.allocation || Object.keys(data.allocation).length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No allocation data available</Typography>
      </Box>
    );
  }

  // Transform allocation data for the chart
  const chartData = Object.entries(data.allocation).map(([category, value]) => ({
    name: category,
    value: value.percentage,
    amount: value.amount
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {data.value}% ({formatNumber(data.amount)} tokens)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {value}: {entry.payload.value}% ({formatNumber(entry.payload.amount)} tokens)
              </Typography>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AllocationChart; 