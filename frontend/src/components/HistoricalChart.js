import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HistoricalChart = ({ data, range }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="no-data">No historical data available</div>;
  }

  const appliances = Object.keys(data);
  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.8)',
    'rgba(255, 107, 107, 0.8)',
    'rgba(255, 217, 61, 0.8)',
    'rgba(107, 207, 127, 0.8)',
    'rgba(72, 219, 251, 0.8)',
  ];

  const datasets = appliances.map((appliance, index) => {
    const applianceData = data[appliance];
    
    return {
      label: appliance,
      data: applianceData.values,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    };
  });

  const chartData = {
    labels: range === 'month' 
      ? data[appliances[0]]?.dates || []
      : data[appliances[0]]?.periods || [],
    datasets: datasets,
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
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 12,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: range === 'month' ? 'Daily Consumption (Past Month)' : 'Monthly Consumption (Past Year)',
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
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default HistoricalChart;
