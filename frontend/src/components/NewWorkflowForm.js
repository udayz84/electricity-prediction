import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ApplianceChecklist from './ApplianceChecklist';
import TimeRangeSelector from './TimeRangeSelector';
import PredictionInput from './PredictionInput';
import './NewWorkflowForm.css';

const NewWorkflowForm = ({ onAnalyze, loading }) => {
  const [selectedAppliances, setSelectedAppliances] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [inputYear, setInputYear] = useState(new Date().getFullYear() + 1);
  const [inputMonth, setInputMonth] = useState(new Date().getMonth() + 1);

  const handleToggleAppliance = (applianceName) => {
    setSelectedAppliances(prev => {
      if (prev.includes(applianceName)) {
        return prev.filter(a => a !== applianceName);
      } else {
        return [...prev, applianceName];
      }
    });
  };

  const handleAnalyze = () => {
    if (selectedAppliances.length === 0) {
      alert('Please select at least one appliance');
      return;
    }

    if (!selectedRange) {
      alert('Please select a time range (Past Month or Past Year)');
      return;
    }

    const requestData = {
      appliances: selectedAppliances,
      range: selectedRange, // 'month' or 'year'
      predictionYear: inputYear,
      predictionMonth: inputMonth
    };

    onAnalyze(requestData);
  };

  const canAnalyze = selectedAppliances.length > 0 && selectedRange !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="new-workflow-form"
    >
      <ApplianceChecklist
        selectedAppliances={selectedAppliances}
        onToggleAppliance={handleToggleAppliance}
      />

      <TimeRangeSelector
        selectedRange={selectedRange}
        onSelectRange={setSelectedRange}
      />

      <PredictionInput
        inputYear={inputYear}
        inputMonth={inputMonth}
        onYearChange={setInputYear}
        onMonthChange={setInputMonth}
      />

      <motion.button
        onClick={handleAnalyze}
        disabled={!canAnalyze || loading}
        className={`analyze-button ${canAnalyze ? 'enabled' : 'disabled'}`}
        whileHover={canAnalyze ? { scale: 1.02 } : {}}
        whileTap={canAnalyze ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : (
          <>
            <span>🚀</span>
            Analyze Consumption
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default NewWorkflowForm;
