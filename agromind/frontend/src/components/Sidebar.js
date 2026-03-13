import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import LanguageSwitcher from './LanguageSwitcher';
import LocationChanger from './LocationChanger';

export default function Sidebar({ activeTab, setActiveTab, sensorData }) {
  const { t } = useLang();
  const { state, district, season } = useLocation();
  const [showLocation, setShowLocation] = useState(false);

  const seasonColors = { Kharif: '#4ADE80', Rabi: '#F59E0B', Zaid: '#22D3EE', Summer: '#F97316', Boro: '#A78BFA' };

  const navItems = [
    { id: 'dashboard',  icon: '🏠', label: t.navDashboard },
    { id: 'disease',    icon: '🔬', label: t.navDisease },
    { id: 'yield',      icon: '📊', label: t.navYield },
    { id: 'irrigation', icon: '💧', label: t.navIrrigation },
    { id: 'fertilizer', icon: '🧪', label: t.navFertilizer },
  ];

  const seasonIcon = season === 'Kharif' ? '🌧️' : season === 'Rabi' ? '❄️' : season === 'Zaid' ? '☀️' : season === 'Boro' ? '💧' : '🌱';

  return (
    <>
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 'var(--sidebar-w)',
        background: 'linear-gradient(180deg, #0F172A 0%, #0A1628 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🌱</div>
          <div style={{
            fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #4ADE80, #22D3EE)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{t.appName}</div>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '3px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {t.appTagline}
          </div>
          <div style={{ marginTop: '12px' }}>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Location button — fully translated */}
        <button onClick={() => setShowLocation(true)} style={{
          margin: '12px 12px 0',
          padding: '10px 12px',
          background: 'rgba(34,211,238,0.06)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: '10px', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '14px' }}>📍</span>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.locationLabel}</span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#22D3EE' }}>{t.locationChange}</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1', marginBottom: '3px' }}>{district}, {state}</div>
          <div style={{ fontSize: '11px', color: seasonColors[season] || '#94A3B8', fontWeight: 600 }}>
            {seasonIcon} {season} {t.locationSeason}
          </div>
        </button>

        {/* Nav */}
        <nav style={{ padding: '12px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', color: '#334155', letterSpacing: '1.5px', marginBottom: '8px', paddingLeft: '8px', textTransform: 'uppercase' }}>
            {t.modules}
          </div>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                marginBottom: '4px', width: '100%', textAlign: 'left',
                background: active ? 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(34,211,238,0.08))' : 'transparent',
                border: active ? '1px solid rgba(74,222,128,0.25)' : '1px solid transparent',
                color: active ? '#4ADE80' : '#64748B',
                fontSize: '13px', fontWeight: active ? 700 : 400,
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        {/* Live sensors */}
        <div style={{ padding: '14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: '#334155', letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase' }}>{t.liveSensors}</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#F59E0B' }}>{sensorData.temp}°C</div>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{t.temp}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#3B82F6' }}>{sensorData.moisture}%</div>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{t.moisture}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', background: 'rgba(74,222,128,0.06)', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.15)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', color: '#64748B' }}>{t.iotOnline}</span>
          </div>
        </div>
      </aside>

      {showLocation && <LocationChanger onClose={() => setShowLocation(false)} />}
    </>
  );
}
