import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import NewWorkflowForm from './components/NewWorkflowForm';
import Analytics from './components/Analytics';

function App() {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/predict_new_workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPredictionData(data);
      // Automatically switch to Analytics section after successful analysis
      setActiveSection('analytics');
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch prediction. Please check if the backend server is running on port 5001.';
      setError(errorMessage);
      console.error('Prediction Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">EnergyInsights</span>
            </div>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-label">MENU</div>
              <div 
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </div>
              <div 
                className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveSection('analytics')}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-text">Analytics</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Settings</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Top Bar */}
          <header className="top-bar">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="energy-status">
              <div className="status-item">
                <span className="status-icon">⚡</span>
                <div className="status-info">
                  <span className="status-label">Energy Insights</span>
                  <span className="status-value">ML-Powered Predictions</span>
                </div>
              </div>
            </div>
            <div className="top-bar-actions">
              {predictionData && (
                <div className="analysis-status">
                  <span className="status-badge">✓ Analysis Complete</span>
                </div>
              )}
              <div className="energy-indicator">
                <span className="indicator-icon">🔋</span>
                <span className="indicator-text">Monitoring</span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="content-area">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {activeSection === 'dashboard' ? (
              <>
                <div className="page-header">
                  <h1>Energy Consumption Dashboard</h1>
                  <p>Analyze and predict your household appliance energy usage</p>
                </div>
                <NewWorkflowForm onAnalyze={handlePredict} loading={loading} />
              </>
            ) : activeSection === 'analytics' ? (
              <Analytics predictionData={predictionData} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
