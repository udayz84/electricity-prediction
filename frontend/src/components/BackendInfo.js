import React from 'react';
import { motion } from 'framer-motion';
import './BackendInfo.css';

const BackendInfo = ({ modelInfo }) => {
  const hasAccuracies = !!(modelInfo && modelInfo.accuracies && Object.keys(modelInfo.accuracies).length > 0);

  if (!modelInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backend-info"
      >
        <h3>🔧 Backend Information</h3>
        <div className="info-item">
          <span className="info-label">ML Models:</span>
          <span className="info-value">Unavailable</span>
        </div>
        <div className="info-item">
          <span className="info-label">Prediction Method:</span>
          <span className="info-value">Statistical (Seasonal Average)</span>
        </div>
      </motion.div>
    );
  }

  const appliances = Object.keys(modelInfo.accuracies || {});
  const avgAccuracy = appliances.length > 0
    ? appliances.reduce((sum, app) => sum + (modelInfo.accuracies[app]?.r2_percent || 0), 0) / appliances.length
    : 0;

  // Determine what to display about ML availability vs loaded state
  const modelsOnDisk = modelInfo.modelsOnDisk ?? 0;
  const modelsLoaded = modelInfo.modelsLoaded ?? 0;
  const mlAvailable = !!modelInfo.usingML;
  const methodLabel = mlAvailable ? 'Machine Learning (Random Forest)' : 'Statistical (Seasonal Average)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backend-info"
    >
      <h3>🔧 Backend Information</h3>
      
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">ML Models:</span>
          <span className="info-value">
            {mlAvailable
              ? (modelsLoaded > 0 ? `Loaded (${modelsLoaded})` : `Available (lazy-loaded) (${modelsOnDisk})`)
              : 'Unavailable'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Average Accuracy:</span>
          <span className={`info-value ${avgAccuracy >= 85 ? 'high-accuracy' : 'low-accuracy'}`}>
            {hasAccuracies ? `${avgAccuracy.toFixed(2)}%` : 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Prediction Method:</span>
          <span className="info-value">{methodLabel}</span>
        </div>
      </div>

      {appliances.length > 0 && (
        <div className="accuracy-table">
          <h4>Model Accuracies (R² Score)</h4>
          <table>
            <thead>
              <tr>
                <th>Appliance</th>
                <th>Accuracy</th>
                <th>MAE</th>
                <th>RMSE</th>
              </tr>
            </thead>
            <tbody>
              {appliances.map(appliance => {
                const acc = modelInfo.accuracies[appliance];
                if (!acc) return null;
                return (
                  <tr key={appliance}>
                    <td>{appliance}</td>
                    <td className={acc.r2_percent >= 85 ? 'high-accuracy' : 'low-accuracy'}>
                      {acc.r2_percent.toFixed(2)}%
                    </td>
                    <td>{acc.mae.toFixed(4)}</td>
                    <td>{acc.rmse.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default BackendInfo;
