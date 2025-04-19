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

  const categories = Object.entries(project.tokenomics.allocation).map(([category, data]) => ({
    name: category,
    percentage: data.percentage,
    amount: data.amount,
    color: data.color || '#000000', // Default color if not specified
  }));

  const months = Array.from({ length: 60 }, (_, i) => i + 1); // 5 years = 60 months

  const calculateVestedAmount = (category, month) => {
    const vesting = project.vesting[category];
    if (!vesting) return 0;

    const { tgePercentage, cliffMonths, vestingMonths } = vesting;
    const totalAmount = project.tokenomics.allocation[category].amount;

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
      data: months.map(month => calculateVestedAmount(category.name, month)),
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
      },
      title: {
        display: true,
        text: 'Vesting Schedule',
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
          text: 'Tokens'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Months'
        }
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