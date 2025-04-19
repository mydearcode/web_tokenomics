import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VestingScheduleChart = ({ project }) => {
  if (!project?.vesting) return null;

  const categories = Object.keys(project.tokenomics.allocation);
  const months = Array.from({ length: 60 }, (_, i) => i); // 5 years of monthly data

  const calculateVestedAmount = (category, month) => {
    const vesting = project.vesting[category];
    const allocation = project.tokenomics.allocation[category];
    
    if (!vesting || !allocation) return 0;

    const { tgePercentage, cliffMonths, vestingMonths } = vesting;
    const totalAmount = allocation.amount;

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

    const remainingPercentage = 100 - tgePercentage;
    const monthlyVesting = (totalAmount * remainingPercentage) / (100 * vestingMonths);
    return (totalAmount * tgePercentage) / 100 + monthlyVesting * monthsAfterCliff;
  };

  const data = {
    labels: months.map(m => `Month ${m}`),
    datasets: categories.map((category, index) => ({
      label: category,
      data: months.map(month => calculateVestedAmount(category, month)),
      borderColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ][index % 6],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      tension: 0.1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString()} tokens`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tokens',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', margin: '20px 0' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default VestingScheduleChart; 