import React from 'react';
import { motion } from 'framer-motion';
import './AlertCard.css';

const AlertCard = ({ alert }) => {
  const getAlertType = (alertText) => {
    if (alertText.includes('High')) return 'high';
    if (alertText.includes('Moderate')) return 'moderate';
    return 'normal';
  };

  const alertType = getAlertType(alert);
  const icons = {
    high: '🔴',
    moderate: '🟡',
    normal: '🟢'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`alert-card alert-${alertType}`}
    >
      <div className="alert-icon">{icons[alertType]}</div>
      <div className="alert-content">
        <h3>{alert}</h3>
        <p>
          {alertType === 'high' && 'Consider reducing usage during peak hours'}
          {alertType === 'moderate' && 'Monitor your consumption patterns'}
          {alertType === 'normal' && 'Your usage is within optimal range'}
        </p>
      </div>
    </motion.div>
  );
};

export default AlertCard;
