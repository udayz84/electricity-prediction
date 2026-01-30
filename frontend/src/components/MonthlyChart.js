import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ChartStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlyChart = ({ data }) => {
  const chartData = {
    labels: data.days,
    datasets: [
      {
        label: 'Daily Consumption (kWh)',
        data: data.values,
        borderColor: 'rgba(118, 75, 162, 1)',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(118, 75, 162, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
        text: 'Monthly Consumption Trend',
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MonthlyChart;
