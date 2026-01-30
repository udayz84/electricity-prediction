import React from 'react';
import { motion } from 'framer-motion';
import DailyChart from './DailyChart';
import MonthlyChart from './MonthlyChart';
import ApplianceChart from './ApplianceChart';
import './ChartContainer.css';

const ChartContainer = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="chart-container"
    >
      <div className="charts-grid">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="chart-card"
        >
          <DailyChart data={data.daily} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="chart-card"
        >
          <MonthlyChart data={data.monthly} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="chart-card"
        >
          <ApplianceChart data={data.appliance} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChartContainer;
