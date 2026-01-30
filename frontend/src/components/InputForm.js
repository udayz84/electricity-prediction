import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './InputForm.css';

const InputForm = ({ onPredict, loading }) => {
  const [formData, setFormData] = useState({
    appliance: 'AC',
    season: 'winter',
    hour: new Date().getHours(),
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const appliances = ['AC', 'Fridge', 'Lights', 'Fan', 'Washing Machine', 'TV'];
  const seasons = ['winter', 'summer', 'autumn', 'rainy'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hour' || name === 'day' || name === 'month' || name === 'year' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  const applianceIcons = {
    'AC': '❄️',
    'Fridge': '🧊',
    'Lights': '💡',
    'Fan': '🌀',
    'Washing Machine': '🧺',
    'TV': '📺'
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onSubmit={handleSubmit}
      className="input-form"
    >
      <div className="form-grid">
        <div className="form-group">
          <label>
            <span className="label-icon">{applianceIcons[formData.appliance]}</span>
            Appliance
          </label>
          <select
            name="appliance"
            value={formData.appliance}
            onChange={handleChange}
            className="form-select"
          >
            {appliances.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">🌍</span>
            Season
          </label>
          <select
            name="season"
            value={formData.season}
            onChange={handleChange}
            className="form-select"
          >
            {seasons.map(season => (
              <option key={season} value={season}>
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">🕐</span>
            Hour
          </label>
          <input
            type="number"
            name="hour"
            value={formData.hour}
            onChange={handleChange}
            min="0"
            max="23"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">📅</span>
            Day
          </label>
          <input
            type="number"
            name="day"
            value={formData.day}
            onChange={handleChange}
            min="1"
            max="31"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">📆</span>
            Month
          </label>
          <input
            type="number"
            name="month"
            value={formData.month}
            onChange={handleChange}
            min="1"
            max="12"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">📆</span>
            Year
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="2020"
            max="2030"
            className="form-input"
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="submit-button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : (
          <>
            <span>🔍</span>
            Analyze Consumption
          </>
        )}
      </motion.button>
    </motion.form>
  );
};

export default InputForm;
