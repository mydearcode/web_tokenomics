import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';

const VestingScheduleChart = ({ project }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (project && project.tokenomics && project.tokenomics.allocation && project.vesting) {
      // Extract categories from allocation
      const cats = Object.keys(project.tokenomics.allocation);
      setCategories(cats);
      
      // Calculate vesting schedule for each category
      const scheduleData = calculateVestingSchedule(project);
      setChartData(scheduleData);
    }
  }, [project]);

  const calculateVestingSchedule = (project) => {
    const { tokenomics, vesting } = project;
    const totalSupply = tokenomics.totalSupply;
    const categories = Object.keys(tokenomics.allocation);
    
    // Find the maximum vesting period
    const maxMonths = Math.max(
      ...categories.map(cat => {
        const vestingInfo = vesting[cat];
        return vestingInfo ? vestingInfo.cliffMonths + vestingInfo.vestingMonths : 0;
      })
    );
    
    // Generate data points for each month
    const data = [];
    for (let month = 0; month <= maxMonths; month++) {
      const dataPoint = { month };
      
      // Calculate vested amount for each category
      categories.forEach(category => {
        const allocation = tokenomics.allocation[category];
        const vestingInfo = vesting[category];
        
        if (allocation && vestingInfo) {
          const { percentage, amount } = allocation;
          const { tgePercentage, cliffMonths, vestingMonths } = vestingInfo;
          
          let vestedPercentage = 0;
          
          // TGE (Token Generation Event) - immediate vesting
          if (month === 0) {
            vestedPercentage = tgePercentage;
          }
          // After cliff period
          else if (month > cliffMonths) {
            // Calculate linear vesting after cliff
            const vestingAfterCliff = 100 - tgePercentage;
            const monthsAfterCliff = month - cliffMonths;
            const monthlyVesting = vestingAfterCliff / vestingMonths;
            
            if (monthsAfterCliff >= vestingMonths) {
              // Fully vested
              vestedPercentage = 100;
            } else {
              // Partially vested
              vestedPercentage = tgePercentage + (monthlyVesting * monthsAfterCliff);
            }
          }
          
          // Calculate vested amount
          const vestedAmount = (amount * vestedPercentage) / 100;
          dataPoint[category] = Number(vestedAmount.toFixed(2));
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!project || !chartData.length) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6">Vesting Schedule</Typography>
        <Typography>No vesting data available</Typography>
      </Paper>
    );
  }

  // Generate colors for each category
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe',
    '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
  ];

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Vesting Schedule</Typography>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Chart" />
        <Tab label="Table" />
      </Tabs>
      
      {activeTab === 0 && (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Months', position: 'bottom' }} />
              <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Month</th>
                {categories.map(category => (
                  <th key={category} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{row.month}</td>
                  {categories.map(category => (
                    <td key={category} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {row[category]?.toLocaleString() || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Paper>
  );
};

export default VestingScheduleChart; 