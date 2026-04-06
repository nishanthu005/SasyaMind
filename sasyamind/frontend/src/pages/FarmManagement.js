import React, { useState } from 'react';

export default function FarmManagement() {
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showAddFarm, setShowAddFarm] = useState(false);
  
  const farms = [
    {
      id: 1,
      name: 'Green Valley Farm',
      location: 'Nashik, Maharashtra',
      area: 45,
      fields: 8,
      manager: 'Rajesh Kumar',
      status: 'Active',
      crops: ['Rice', 'Wheat', 'Cotton'],
      health: 85,
      lastUpdated: '2025-04-03'
    },
    {
      id: 2,
      name: 'Sunshine Acres',
      location: 'Pune, Maharashtra',
      area: 32,
      fields: 6,
      manager: 'Priya Sharma',
      status: 'Active',
      crops: ['Tomato', 'Maize'],
      health: 92,
      lastUpdated: '2025-04-03'
    },
    {
      id: 3,
      name: 'Golden Harvest',
      location: 'Satara, Maharashtra',
      area: 28,
      fields: 5,
      manager: 'Amit Patel',
      status: 'Maintenance',
      crops: ['Sugarcane', 'Soybean'],
      health: 78,
      lastUpdated: '2025-04-02'
    }
  ];

  const FarmCard = ({ farm }) => {
    const isSelected = selectedFarm === farm.id;
    const statusColor = farm.status === 'Active' ? '#4ADE80' : '#F59E0B';
    const healthColor = farm.health >= 85 ? '#4ADE80' : farm.health >= 70 ? '#F59E0B' : '#EF4444';

    return (
      <div
        onClick={() => setSelectedFarm(isSelected ? null : farm.id)}
        style={{
          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg)',
          border: isSelected ? '2px solid #3B82F6' : '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: isSelected ? '#3B82F6' : 'var(--text)', marginBottom: '4px' }}>
              {farm.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              📍 {farm.location}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {farm.crops.map(crop => (
                <span key={crop} className="tag tag-gray" style={{ fontSize: '11px' }}>
                  {crop}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span className={`tag ${farm.status === 'Active' ? 'tag-green' : 'tag-orange'}`} style={{ fontSize: '11px' }}>
              {farm.status}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Updated: {farm.lastUpdated}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Area</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{farm.area} ha</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Fields</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{farm.fields}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Manager</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{farm.manager.split(' ')[0]}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Health</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: healthColor }}>{farm.health}%</div>
          </div>
        </div>

        {isSelected && (
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            background: 'var(--surface)', 
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#3B82F6' }}>
              📊 Farm Details - {farm.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px' }}>
              <div><strong>Total Area:</strong> {farm.area} hectares</div>
              <div><strong>Field Count:</strong> {farm.fields} fields</div>
              <div><strong>Primary Crops:</strong> {farm.crops.join(', ')}</div>
              <div><strong>Health Score:</strong> {farm.health}%</div>
              <div><strong>Manager:</strong> {farm.manager}</div>
              <div><strong>Status:</strong> {farm.status}</div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-blue" style={{ fontSize: '11px', padding: '4px 8px' }}>
                📊 View Analytics
              </button>
              <button className="btn btn-green" style={{ fontSize: '11px', padding: '4px 8px' }}>
                ⚙️ Manage Fields
              </button>
              <button className="btn btn-orange" style={{ fontSize: '11px', padding: '4px 8px' }}>
                📝 Edit Farm
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🏡 Farm Management</div>
          <div className="page-sub">Multi-farm operations and field management</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-blue"
            onClick={() => setShowAddFarm(true)}
          >
            ➕ Add Farm
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4">
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏡</div>
          <div className="stat-value" style={{ color: '#4ADE80' }}>{farms.length}</div>
          <div className="stat-label">Total Farms</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📐</div>
          <div className="stat-value" style={{ color: '#3B82F6' }}>{farms.reduce((sum, farm) => sum + farm.area, 0)}</div>
          <div className="stat-label">Total Area (ha)</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div className="stat-value" style={{ color: '#F59E0B' }}>{farms.reduce((sum, farm) => sum + farm.fields, 0)}</div>
          <div className="stat-label">Total Fields</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💚</div>
          <div className="stat-value" style={{ color: '#8B5CF6' }}>{Math.round(farms.reduce((sum, farm) => sum + farm.health, 0) / farms.length)}%</div>
          <div className="stat-label">Avg Health</div>
        </div>
      </div>

      {/* Farm List */}
      <div className="card">
        <div className="section-title">🏡 Farm Portfolio</div>
        {farms.map(farm => (
          <FarmCard key={farm.id} farm={farm} />
        ))}
      </div>

      {/* Add Farm Modal */}
      {showAddFarm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              ➕ Add New Farm
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input className="input" placeholder="Farm Name" />
              <input className="input" placeholder="Location" />
              <input className="input" type="number" placeholder="Area (hectares)" />
              <input className="input" type="number" placeholder="Number of Fields" />
              <input className="input" placeholder="Manager Name" />
              <select className="select">
                <option>Select Status</option>
                <option>Active</option>
                <option>Maintenance</option>
                <option>Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-gray"
                onClick={() => setShowAddFarm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-green">
                Add Farm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
