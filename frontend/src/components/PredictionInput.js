import React from 'react';
import { motion } from 'framer-motion';
import './PredictionInput.css';

const PredictionInput = ({ inputYear, inputMonth, onYearChange, onMonthChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i - 5); // 5 years back to 5 years forward
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="prediction-input-container"
    >
      <h3 className="input-title">
        <span className="title-icon">🔮</span>
        Prediction Target
      </h3>
      <p className="input-subtitle">Select the year and month for future consumption prediction</p>
      
      <div className="input-grid">
        <div className="input-group">
          <label>
            <span className="label-icon">📆</span>
            Year
          </label>
          <select
            value={inputYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="form-select"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>
            <span className="label-icon">📅</span>
            Month
          </label>
          <select
            value={inputMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="form-select"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.name}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionInput;
