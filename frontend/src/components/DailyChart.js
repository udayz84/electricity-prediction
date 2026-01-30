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
import './ChartStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DailyChart = ({ data }) => {
  const chartData = {
    labels: data.hours.map(h => `${h}:00`),
    datasets: [
      {
        label: 'Consumption (kWh)',
        data: data.values,
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
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
        text: 'Hourly Consumption Pattern',
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

export default DailyChart;
