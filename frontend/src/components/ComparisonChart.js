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

const ComparisonChart = ({ historical, predicted, range }) => {
  if (!historical || !predicted || Object.keys(historical).length === 0) {
    return <div className="no-data">No comparison data available</div>;
  }

  const appliances = Object.keys(predicted);
  
  // Calculate average historical usage per appliance for comparison
  const historicalAverages = appliances.map(appliance => {
    if (historical[appliance]) {
      const values = historical[appliance].values;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return avg;
    }
    return 0;
  });

  const predictedValues = appliances.map(app => predicted[app].predicted || 0);

  const chartData = {
    labels: appliances,
    datasets: [
      {
        label: 'Historical Average',
        data: historicalAverages,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Predicted',
        data: predictedValues,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '500',
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`;
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
    <div className="chart-container" style={{ height: '400px', padding: '10px 0' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ComparisonChart;
