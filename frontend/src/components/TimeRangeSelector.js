import React from 'react';
import { motion } from 'framer-motion';
import './TimeRangeSelector.css';

const TimeRangeSelector = ({ selectedRange, onSelectRange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="time-range-container"
    >
      <h3 className="range-title">
        <span className="title-icon">📅</span>
        Select Historical Period
      </h3>
      <p className="range-subtitle">Choose the time period for historical data analysis</p>
      
      <div className="range-buttons">
        <motion.button
          className={`range-button ${selectedRange === 'month' ? 'active' : ''}`}
          onClick={() => onSelectRange('month')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="button-icon">📆</span>
          <span className="button-text">Past Month</span>
          <span className="button-desc">Last 30 days</span>
        </motion.button>
        
        <motion.button
          className={`range-button ${selectedRange === 'year' ? 'active' : ''}`}
          onClick={() => onSelectRange('year')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="button-icon">📅</span>
          <span className="button-text">Past Year</span>
          <span className="button-desc">Last 12 months</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TimeRangeSelector;
