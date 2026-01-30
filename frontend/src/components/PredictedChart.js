import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PredictedChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="no-data">No prediction data available</div>;
  }

  const appliances = Object.keys(data);
  const predictedValues = appliances.map(app => data[app].predicted);

  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.8)',
    'rgba(255, 107, 107, 0.8)',
    'rgba(255, 217, 61, 0.8)',
    'rgba(107, 207, 127, 0.8)',
    'rgba(72, 219, 251, 0.8)',
  ];

  const chartData = {
    labels: appliances,
    datasets: [
      {
        label: 'Predicted Consumption (kWh)',
        data: predictedValues,
        backgroundColor: colors.slice(0, appliances.length),
        borderColor: colors.slice(0, appliances.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Predicted Monthly Consumption',
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
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y.toFixed(2)} kWh`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
        border: {
          color: '#e5e7eb',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
        border: {
          color: '#e5e7eb',
        },
        title: {
          display: true,
          text: 'Consumption (kWh)',
          color: '#6b7280',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '320px', padding: '10px 0' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PredictedChart;
