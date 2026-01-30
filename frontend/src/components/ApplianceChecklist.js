import React from 'react';
import { motion } from 'framer-motion';
import './ApplianceChecklist.css';

const ApplianceChecklist = ({ appliances, selectedAppliances, onToggleAppliance }) => {
  // Expanded appliance list with icons (20 appliances - removed 10 less-used ones)
  const applianceList = [
    { name: 'AC', icon: '❄️', key: 'ac' },
    { name: 'Fridge', icon: '🧊', key: 'fridge' },
    { name: 'Lights', icon: '💡', key: 'lights' },
    { name: 'Fan', icon: '🌀', key: 'fans' },
    { name: 'Washing Machine', icon: '🧺', key: 'washing_machine' },
    { name: 'TV', icon: '📺', key: 'tv' },
    { name: 'Microwave', icon: '🍽️', key: 'microwave' },
    { name: 'Oven', icon: '🔥', key: 'oven' },
    { name: 'Dishwasher', icon: '🍽️', key: 'dishwasher' },
    { name: 'Water Heater', icon: '🚿', key: 'water_heater' },
    { name: 'Dryer', icon: '🌪️', key: 'dryer' },
    { name: 'Computer', icon: '💻', key: 'computer' },
    { name: 'Motor', icon: '⚙️', key: 'motor' },
    { name: 'Sound System', icon: '🔊', key: 'sound_system' },
    { name: 'Electric Stove', icon: '🍳', key: 'stove' },
    { name: 'Refrigerator', icon: '🧊', key: 'refrigerator' },
    { name: 'Freezer', icon: '🧊', key: 'freezer' },
    { name: 'Air Purifier', icon: '🌬️', key: 'air_purifier' },
    { name: 'Humidifier', icon: '💧', key: 'humidifier' },
    { name: 'Dehumidifier', icon: '🌡️', key: 'dehumidifier' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="appliance-checklist-container"
    >
      <h3 className="checklist-title">
        <span className="title-icon">📋</span>
        Select Appliances
      </h3>
      <p className="checklist-subtitle">Choose one or more appliances to analyze</p>
      
      <div className="checklist-grid">
        {applianceList.map((appliance) => {
          const isSelected = selectedAppliances.includes(appliance.name);
          
          return (
            <motion.label
              key={appliance.name}
              className={`appliance-checkbox ${isSelected ? 'selected' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleAppliance(appliance.name)}
              />
              <span className="checkbox-icon">{appliance.icon}</span>
              <span className="checkbox-label">{appliance.name}</span>
            </motion.label>
          );
        })}
      </div>
      
      {selectedAppliances.length > 0 && (
        <div className="selected-count">
          {selectedAppliances.length} appliance{selectedAppliances.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </motion.div>
  );
};

export default ApplianceChecklist;
