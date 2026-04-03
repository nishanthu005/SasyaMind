import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang, translations } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = translations[lang];

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: '10px', padding: '8px 14px',
          color: '#CBD5E1', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '16px' }}>{current.flag}</span>
        <span>{current.name}</span>
        <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '2px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#0F172A', border: '1px solid #1E293B',
          borderRadius: '12px', minWidth: '160px', overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 999,
          animation: 'fadeIn 0.15s ease',
        }}>
          {Object.entries(translations).map(([code, tr]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px',
                background: lang === code ? 'rgba(74,222,128,0.1)' : 'transparent',
                border: 'none', borderBottom: '1px solid #1E293B',
                color: lang === code ? '#4ADE80' : '#94A3B8',
                fontSize: '13px', fontWeight: lang === code ? 700 : 400,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (lang !== code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (lang !== code) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '18px' }}>{tr.flag}</span>
              <span>{tr.name}</span>
              {lang === code && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
