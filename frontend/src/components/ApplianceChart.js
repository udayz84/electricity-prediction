import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './ChartStyles.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ApplianceChart = ({ data }) => {
  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.8)',
    'rgba(255, 107, 107, 0.8)',
    'rgba(255, 217, 61, 0.8)',
    'rgba(107, 207, 127, 0.8)',
    'rgba(72, 219, 251, 0.8)',
  ];

  const borderColors = [
    'rgba(102, 126, 234, 1)',
    'rgba(118, 75, 162, 1)',
    'rgba(255, 107, 107, 1)',
    'rgba(255, 217, 61, 1)',
    'rgba(107, 207, 127, 1)',
    'rgba(72, 219, 251, 1)',
  ];

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: colors.slice(0, data.labels.length),
        borderColor: borderColors.slice(0, data.labels.length),
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500',
          },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Appliance-wise Consumption',
        font: {
          size: 16,
          weight: '600',
          family: "'Inter', sans-serif",
        },
        color: '#111827',
        padding: {
          top: 0,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toFixed(2)} kWh (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '400px', padding: '10px 0' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ApplianceChart;
