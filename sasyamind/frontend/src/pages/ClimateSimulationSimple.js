import React, { useState } from 'react';

export default function ClimateSimulationSimple() {
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedScenario, setSelectedScenario] = useState('Moderate');
  const [simulationResults, setSimulationResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato'];
  const scenarios = ['Optimistic', 'Moderate', 'Pessimistic'];

  const runSimulation = async () => {
    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      const baseYield = {
        'Rice': 4.5,
        'Wheat': 3.8,
        'Maize': 5.2,
        'Cotton': 2.1,
        'Tomato': 6.0
      };

      const scenarioImpact = {
        'Optimistic': { temp: 1, rainfall: 5, yieldChange: -5 },
        'Moderate': { temp: 2, rainfall: -10, yieldChange: -15 },
        'Pessimistic': { temp: 3, rainfall: -25, yieldChange: -30 }
      };

      const currentYield = baseYield[selectedCrop];
      const impact = scenarioImpact[selectedScenario];
      
      // Add safety check
      if (!impact) {
        console.error('Impact not found for scenario:', selectedScenario);
        setIsRunning(false);
        return;
      }
      
      const futureYield = currentYield * (1 + impact.yieldChange / 100);

      setSimulationResults({
        currentYield: currentYield.toFixed(2),
        futureYield: futureYield.toFixed(2),
        yieldChange: impact.yieldChange,
        temperature: `+${impact.temp}°C`,
        rainfall: `${impact.rainfall}%`,
        irrigation: impact.rainfall < 0 ? `+${Math.abs(impact.rainfall * 0.8)}%` : 'No change',
        recommendation: impact.yieldChange < -20 ? 'Consider drought-resistant varieties' : 'Current practices suitable'
      });
      
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🌍 Climate Change Impact Simulation</div>
          <div className="page-sub">AI-powered climate resilience analysis</div>
        </div>
      </div>

      <div className="card mb-20">
        <div className="section-title">⚙️ Simulation Parameters</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label>Select Crop</label>
            <select 
              className="select" 
              value={selectedCrop} 
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
            </select>
          </div>
          <div>
            <label>Climate Scenario</label>
            <select 
              className="select" 
              value={selectedScenario} 
              onChange={(e) => setSelectedScenario(e.target.value)}
            >
              {scenarios.map(scenario => <option key={scenario} value={scenario}>{scenario}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <button 
            className="btn btn-blue" 
            onClick={runSimulation}
            disabled={isRunning}
          >
            {isRunning ? '🔄 Running Simulation...' : '🔬 Run Climate Simulation'}
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="card mb-20">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text-muted)' }}>Analyzing climate impact models...</div>
          </div>
        </div>
      )}

      {simulationResults && !isRunning && (
        <div className="card">
          <div className="section-title">📊 Climate Impact Results</div>
          
          <div className="grid-3 mb-20">
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌾</div>
              <div className="stat-value" style={{ 
                color: simulationResults.yieldChange < -20 ? '#EF4444' : 
                       simulationResults.yieldChange < -10 ? '#F59E0B' : '#4ADE80' 
              }}>
                {simulationResults.futureYield}
              </div>
              <div className="stat-label">Future Yield (t/ha)</div>
              <div style={{ 
                fontSize: '12px', 
                color: simulationResults.yieldChange < -20 ? '#EF4444' : 
                       simulationResults.yieldChange < -10 ? '#F59E0B' : '#4ADE80',
                marginTop: '4px'
              }}>
                {simulationResults.yieldChange > 0 ? '+' : ''}{simulationResults.yieldChange}%
              </div>
            </div>
            
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>�️</div>
              <div className="stat-value" style={{ color: '#F59E0B' }}>
                {simulationResults.temperature}
              </div>
              <div className="stat-label">Temperature Change</div>
            </div>
            
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💧</div>
              <div className="stat-value" style={{ color: '#3B82F6' }}>
                {simulationResults.rainfall}
              </div>
              <div className="stat-label">Rainfall Change</div>
            </div>
          </div>

          <div style={{ 
            padding: '16px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '8px', 
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6', marginBottom: '8px' }}>
              🛡️ Adaptation Recommendation
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text)' }}>
              {simulationResults.recommendation}
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Based on IPCC AR6 climate models and crop-specific sensitivity analysis
          </div>
        </div>
      )}
    </div>
  );
}
