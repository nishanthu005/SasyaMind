import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { getDashboard } from '../context/api';
import { useLang } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';

function StatCard({ icon, label, value, suffix, accent }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const target = parseFloat(value); const step = target / 40;
    const t = setInterval(() => { start += step; if (start >= target) { setDisplay(target); clearInterval(t); } else setDisplay(Math.round(start * 10) / 10); }, 25);
    return () => clearInterval(t);
  }, [value]);
  return (
    <div className="card" style={{ borderColor: accent + '30', background: `linear-gradient(135deg, ${accent}08, var(--surface))` }}>
      <div style={{ fontSize: '26px', marginBottom: '10px' }}>{icon}</div>
      <div className="stat-value" style={{ color: accent }}>{display}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#94A3B8', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</div>)}
    </div>
  );
  return null;
};

const seasonColors = { Kharif: '#4ADE80', Rabi: '#F59E0B', Zaid: '#22D3EE', Summer: '#F97316', Boro: '#A78BFA' };

export default function Dashboard() {
  const { t } = useLang();
  const { state, district, season } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboard().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [state, district, season]);

  if (loading) return <div style={{ textAlign: 'center', paddingTop: '80px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>;
  if (!data) return <div style={{ color: 'var(--text-muted)', paddingTop: '40px' }}>Could not load dashboard. Make sure backend is running.</div>;

  const sColor = seasonColors[season] || '#4ADE80';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🌾 {t.dashTitle}</div>
          {/* Dynamic location subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>📍 {district}, {state}, India</span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: sColor, background: sColor + '15', padding: '2px 10px', borderRadius: '20px', border: `1px solid ${sColor}30` }}>
              {season === 'Kharif' ? '🌧️' : season === 'Rabi' ? '❄️' : season === 'Zaid' ? '☀️' : '🌱'} {season} Season 2025
            </span>
          </div>
        </div>
        <span className="tag tag-green">{t.allActive}</span>
      </div>

      {/* Location info banner */}
      <div style={{ background: `${sColor}08`, border: `1px solid ${sColor}20`, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '24px' }}>🗺️</span>
        <div>
          <span style={{ fontWeight: 700, color: '#CBD5E1' }}>{district} District, {state}</span>
          <span style={{ color: '#475569', fontSize: '13px', marginLeft: '8px' }}>— {t.cropAdvisory}</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748B' }}>
          Default crop: <span style={{ color: sColor, fontWeight: 700 }}>{data.fields?.[0]?.crop || 'Rice'}</span>
        </div>
      </div>

      <div className="grid-4">
        <StatCard icon="🌿" label={t.cropHealth} value={data.farm_stats.health_score} suffix="%" accent="#4ADE80" />
        <StatCard icon="📈" label={t.predictedYield} value={data.farm_stats.predicted_yield} suffix=" t/ha" accent="#22D3EE" />
        <StatCard icon="💧" label={t.waterSaved} value={data.farm_stats.water_saved_pct} suffix="%" accent="#3B82F6" />
        <StatCard icon="⚠️" label={t.activeAlerts} value={data.farm_stats.active_alerts} suffix="" accent="#EF4444" />
      </div>

      <div className="grid-2">
        <div className="card mb-20">
          <div className="section-title">🌤 {t.weeklyWeather} · {district}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weather} barGap={4}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="temp" name="Temp °C" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rain" name="Rain mm" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card mb-20">
          <div className="section-title">🔔 {t.smartAlerts}</div>
          {data.alerts.map((a, i) => {
            const colors = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };
            const color = colors[a.severity] || '#64748B';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '11px 0', borderBottom: i < data.alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>{a.message}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{a.time}</div>
                </div>
                <span className={`tag tag-${a.severity === 'high' ? 'red' : a.severity === 'medium' ? 'orange' : 'green'}`} style={{ flexShrink: 0 }}>{a.severity}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">📊 {t.yieldTrend}</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.yield_trend}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="yield" name="Yield" stroke={sColor} strokeWidth={2.5} dot={{ fill: sColor, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">🗺 {t.myFields} · {state}</div>
          {data.fields.map((f, i) => (
            <div key={i} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px', marginBottom: i < data.fields.length - 1 ? '10px' : 0, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Field {f.id}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '8px' }}>{f.crop} · {f.area} ha</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`tag ${f.health === 'Good' ? 'tag-green' : 'tag-orange'}`}>{f.health}</span>
                  <span className="tag tag-gray">{f.stage}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="progress-bar" style={{ flex: 1, height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${f.soil_moisture}%`, background: f.soil_moisture < 45 ? '#EF4444' : sColor }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '70px' }}>💧 {f.soil_moisture}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
