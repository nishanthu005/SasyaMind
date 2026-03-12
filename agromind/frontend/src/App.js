import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import Irrigation from './pages/Irrigation';
import Fertilizer from './pages/Fertilizer';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function AppInner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState({ temp: 28.4, moisture: 62 });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        temp: +(28 + Math.sin(Date.now() / 5000) * 2).toFixed(1),
        moisture: Math.floor(60 + Math.cos(Date.now() / 7000) * 8)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pages = { dashboard: Dashboard, disease: DiseaseDetection, yield: YieldPrediction, irrigation: Irrigation, fertilizer: Fertilizer };
  const PageComponent = pages[activeTab] || Dashboard;

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sensorData={sensorData} />
      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
