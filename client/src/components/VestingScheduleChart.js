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

const VestingScheduleChart = ({ project }) => {
  if (!project?.vesting) return null;

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

  const data = {
    labels: months,
    datasets: categories.map(category => ({
      label: `${category.name} (${category.percentage}%)`,
      data: months.map(month => calculateVestedAmount(category, month)),
      borderColor: category.color,
      backgroundColor: category.color,
      tension: 0.1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Vesting Schedule',
        color: '#333',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw.toLocaleString();
            return `${label}: ${value} tokens`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tokens',
          color: '#333',
        },
        ticks: {
          color: '#333',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Months',
          color: '#333',
        },
        ticks: {
          color: '#333',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      }
    }
  };

  return (
    <div style={{ height: '400px', marginTop: '20px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default VestingScheduleChart; 