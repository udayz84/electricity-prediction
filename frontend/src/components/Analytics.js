import React from 'react';
import { motion } from 'framer-motion';
import WorkflowResults from './WorkflowResults';
import './Analytics.css';

const Analytics = ({ predictionData }) => {


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-page"
    >
      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>View detailed energy consumption analytics and model performance</p>
      </div>

      {/* Analytics from Prediction Data */}
      {predictionData ? (
        <WorkflowResults data={predictionData} />
      ) : (
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>No Analytics Data Available</h3>
          <p>Run an analysis from the Dashboard to view detailed analytics here.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
