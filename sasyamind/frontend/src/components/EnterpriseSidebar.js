import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';

export default function EnterpriseSidebar({ currentPage, setCurrentPage, userRole, userName }) {
  const { t } = useLang();
  const [enterpriseMenuOpen, setEnterpriseMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'overview',
      icon: '📊',
      label: 'Enterprise Overview',
      roles: ['admin', 'manager', 'supervisor', 'user']
    },
    {
      id: 'farms',
      icon: '🏡',
      label: 'Farm Management',
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      id: 'analytics',
      icon: '📈',
      label: 'Advanced Analytics',
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      id: 'team',
      icon: '👥',
      label: 'Team Management',
      roles: ['admin', 'manager']
    },
    {
      id: 'inventory',
      icon: '📦',
      label: 'Inventory & Resources',
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      id: 'reports',
      icon: '📋',
      label: 'Reports & Compliance',
      roles: ['admin', 'manager']
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Enterprise Settings',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="sidebar">
      {/* Enterprise Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #1e40af, #3730a3)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🏢
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>SasyaMind Pro</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{userName}</div>
          </div>
        </div>
        <div style={{ 
          fontSize: '11px', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
          background: 'rgba(255,255,255,0.1)',
          padding: '4px 8px',
          borderRadius: '12px',
          display: 'inline-block'
        }}>
          {userRole}
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              background: currentPage === 'dashboard' ? 'var(--blue)' : 'transparent',
              color: currentPage === 'dashboard' ? 'white' : 'var(--text)',
              borderRadius: '8px',
              padding: '12px 16px',
              width: '100%',
              textAlign: 'left',
              marginBottom: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span style={{ marginRight: '8px' }}>🌾</span>
            {t.navDashboard}
          </button>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <button
            onClick={() => setEnterpriseMenuOpen(!enterpriseMenuOpen)}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '8px 16px',
              width: '100%',
              textAlign: 'left',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span>Enterprise Features</span>
            <span>{enterpriseMenuOpen ? '▼' : '▶'}</span>
          </button>
        </div>

        {enterpriseMenuOpen && (
          <div style={{ paddingLeft: '8px' }}>
            {filteredMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  background: currentPage === item.id ? 'var(--blue)' : 'transparent',
                  color: currentPage === item.id ? 'white' : 'var(--text)',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '2px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Original Modules */}
        <div style={{ 
          marginTop: '20px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px'
        }}>
          Core Modules
        </div>

        {['disease', 'yield', 'irrigation', 'fertilizer'].map(module => (
          <button
            key={module}
            onClick={() => setCurrentPage(module)}
            style={{
              background: currentPage === module ? 'var(--blue)' : 'transparent',
              color: currentPage === module ? 'white' : 'var(--text)',
              borderRadius: '8px',
              padding: '12px 16px',
              width: '100%',
              textAlign: 'left',
              marginBottom: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span style={{ marginRight: '8px' }}>
              {module === 'disease' ? '🔬' : 
               module === 'yield' ? '📊' : 
               module === 'irrigation' ? '💧' : '🧪'}
            </span>
            {module === 'disease' ? t.navDisease :
             module === 'yield' ? t.navYield :
             module === 'irrigation' ? t.navIrrigation : t.navFertilizer}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: 'auto', 
        padding: '20px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px' }}>Enterprise License</div>
        <div style={{ fontSize: '10px' }}>© 2025 SasyaMind Pro</div>
      </div>
    </div>
  );
}
