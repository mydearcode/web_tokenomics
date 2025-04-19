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
  if (!project?.vesting?.categories) return null;

  const { vesting, tokenomics } = project;
  const { categories } = vesting;

  const months = Array.from({ length: 60 }, (_, i) => i + 1);

  const calculateVestedAmount = (category, month) => {
    const { percentage, amount, startMonth, vestingPeriod } = category;
    const totalAmount = amount || (tokenomics.totalSupply * percentage) / 100;

    if (month < startMonth) return 0;
    if (month >= startMonth + vestingPeriod) return totalAmount;

    const vestedMonths = month - startMonth;
    return (totalAmount * vestedMonths) / vestingPeriod;
  };

  const data = {
    labels: months,
    datasets: Object.entries(categories).map(([category, details], index) => ({
      label: `${category} (${details.percentage}%)`,
      data: months.map(month => calculateVestedAmount(details, month)),
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length],
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