import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EnterpriseSidebar from './components/EnterpriseSidebar';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import Irrigation from './pages/Irrigation';
import Fertilizer from './pages/Fertilizer';
import EnterpriseOverview from './pages/EnterpriseOverview';
import FarmManagement from './pages/FarmManagement';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import ClimateSimulationSimple from './pages/ClimateSimulationSimple';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { UserProvider } from './context/UserContext';
import './App.css';

function AppInner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState({ temp: 28.4, moisture: 62 });
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(true); // Toggle between normal and enterprise

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        temp: +(28 + Math.sin(Date.now() / 5000) * 2).toFixed(1),
        moisture: Math.floor(60 + Math.cos(Date.now() / 7000) * 8)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pages = {
    dashboard: Dashboard,
    disease: DiseaseDetection,
    yield: YieldPrediction,
    irrigation: Irrigation,
    fertilizer: Fertilizer,
    climate: ClimateSimulationSimple,
    // Enterprise pages
    overview: EnterpriseOverview,
    farms: FarmManagement,
    analytics: AdvancedAnalytics,
    climate_enterprise: ClimateSimulationSimple
  };

  const PageComponent = pages[activeTab] || Dashboard;

  return (
    <div className="app">
      {isEnterpriseMode ? (
        <EnterpriseSidebar 
          currentPage={activeTab} 
          setCurrentPage={setActiveTab} 
          userRole="admin"
          userName="Agricultural Manager"
        />
      ) : (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sensorData={sensorData} />
      )}
      <main className="main-content">
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          zIndex: 1000,
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          fontSize: '11px'
        }}>
          <button 
            onClick={() => setIsEnterpriseMode(!isEnterpriseMode)}
            style={{ 
              background: isEnterpriseMode ? '#3B82F6' : '#4ADE80',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {isEnterpriseMode ? '🏢 Enterprise' : '🌾 Standard'}
          </button>
        </div>
        <PageComponent />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <UserProvider>
          <AppInner />
        </UserProvider>
      </LocationProvider>
    </LanguageProvider>
  );
}
