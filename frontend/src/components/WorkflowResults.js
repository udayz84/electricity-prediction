import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import HistoricalChart from './HistoricalChart';
import PredictedChart from './PredictedChart';
import ComparisonChart from './ComparisonChart';
import BackendInfo from './BackendInfo';
import './WorkflowResults.css';

const WorkflowResults = ({ data }) => {
  // Calculate metrics - must be called before any conditional returns
  const metrics = useMemo(() => {
    if (!data) {
      return {
        totalHistorical: '0.00',
        totalPredicted: '0.00',
        avgHistorical: '0.00',
        avgPredicted: '0.00',
        changePercent: 0,
        applianceCount: 0
      };
    }

    const historical = data.historical || {};
    const predicted = data.predicted || {};
    const range = data.range || 'month';
    
    // Calculate total historical consumption
    let totalHistorical = 0;
    let totalPredicted = 0;
    let applianceCount = 0;
    
    Object.keys(historical).forEach(appliance => {
      const values = historical[appliance]?.values || [];
      const sum = values.reduce((a, b) => a + b, 0);
      totalHistorical += sum;
      applianceCount++;
    });
    
    Object.keys(predicted).forEach(appliance => {
      const predictedValue = predicted[appliance]?.predicted || 0;
      totalPredicted += predictedValue;
    });
    
    const avgHistorical = applianceCount > 0 ? totalHistorical / applianceCount : 0;
    const avgPredicted = applianceCount > 0 ? totalPredicted / applianceCount : 0;
    
    // For year range: normalize historical to monthly average (divide by 12)
    // For month range: use total as-is (already monthly)
    const normalizedHistorical = range === 'year' 
      ? (applianceCount > 0 ? totalHistorical / applianceCount / 12 : 0)
      : (applianceCount > 0 ? totalHistorical / applianceCount : 0);
    
    // Calculate change percentage - compare normalized monthly historical vs monthly predicted
    const changePercent = normalizedHistorical > 0 
      ? ((avgPredicted - normalizedHistorical) / normalizedHistorical * 100).toFixed(1)
      : 0;
    
    return {
      totalHistorical: totalHistorical.toFixed(2),
      totalPredicted: totalPredicted.toFixed(2),
      avgHistorical: avgHistorical.toFixed(2),
      avgPredicted: avgPredicted.toFixed(2),
      normalizedHistorical: normalizedHistorical.toFixed(2),
      changePercent: parseFloat(changePercent),
      applianceCount
    };
  }, [data]);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="workflow-results"
    >
      <div className="results-header">
        <h2>Analysis Results</h2>
        <div className="results-info">
          <span className="info-badge">Range: {data.range === 'month' ? 'Past Month' : 'Past Year'}</span>
          <span className="info-badge">Prediction: {data.predictionPeriod}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-title">
            Historical Consumption
            {data.range === 'month' ? ' (Past Month)' : ' (Past Year)'}
          </div>
          <div className="metric-card-value">{metrics.totalHistorical}</div>
          <div className="metric-card-change">
            <span>kWh total</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-title">Predicted Consumption</div>
          <div className="metric-card-value">{metrics.totalPredicted}</div>
          <div className="metric-card-change">
            <span>kWh for {data.predictionPeriod}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-title">
            {data.range === 'year' 
              ? 'Historical Monthly Avg' 
              : metrics.applianceCount > 1 
                ? 'Average per Appliance' 
                : 'Total per Appliance'}
          </div>
          <div className="metric-card-value">
            {data.range === 'year' ? metrics.normalizedHistorical : metrics.avgHistorical}
          </div>
          <div className="metric-card-change">
            <span>
              {data.range === 'year' 
                ? 'kWh/month average' 
                : `kWh ${metrics.applianceCount > 1 ? 'average' : 'total'}`}
            </span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-title">Change</div>
          <div className="metric-card-value">{Math.abs(metrics.changePercent)}%</div>
          <div className={`metric-card-change ${metrics.changePercent >= 0 ? 'positive' : 'negative'}`}>
            {metrics.changePercent >= 0 ? '↑' : '↓'} {metrics.changePercent >= 0 ? 'increase' : 'decrease'}
            {data.range === 'year' && <span style={{fontSize: '10px', marginLeft: '4px', opacity: 0.7}}>(vs monthly avg)</span>}
          </div>
        </div>
      </div>

      <div className="results-grid">
        <div className="results-section historical-section">
          <h3>Historical Usage</h3>
          <HistoricalChart data={data.historical} range={data.range} />
        </div>

        <div className="results-section predicted-section">
          <h3>Predicted Usage</h3>
          <PredictedChart data={data.predicted} />
        </div>

        <div className="results-section full-width comparison-section">
          <h3>Historical vs Predicted Comparison</h3>
          <ComparisonChart historical={data.historical} predicted={data.predicted} range={data.range} />
        </div>
      </div>

      {data.alert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="results-alert"
        >
          {data.alert}
        </motion.div>
      )}

      {data.modelInfo && (
        <BackendInfo modelInfo={data.modelInfo} />
      )}
    </motion.div>
  );
};

export default WorkflowResults;
