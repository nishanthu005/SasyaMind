/**
 * OfflineBanner.js
 * Drop this in src/components/OfflineBanner.js
 *
 * Shows:
 *  - A red banner when offline (with last-cached timestamp)
 *  - A green "Install app" button when installable
 *  - A blue "Update available" button when a new SW is waiting
 */

import React, { useEffect, useState } from 'react';
import { usePWA } from '../hooks/usePWA';

const BANNER_BASE = {
  position:       'sticky',
  top:            0,
  zIndex:         1000,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  gap:            '12px',
  padding:        '10px 16px',
  fontSize:       '13px',
  fontWeight:     500,
  borderBottom:   '1px solid transparent',
  transition:     'all 0.2s ease',
};

export default function OfflineBanner() {
  const { isOnline, isInstallable, promptInstall, updateAvailable, applyUpdate } = usePWA();
  const [cachedAt, setCachedAt] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('sasyamind_dashboard_cache_at');
    if (raw) {
      const dt = new Date(raw);
      setCachedAt(dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [isOnline]);

  // Reset dismiss when coming back online
  useEffect(() => { if (isOnline) setDismissed(false); }, [isOnline]);

  if (!isOnline && !dismissed) {
    return (
      <div style={{ ...BANNER_BASE, background: '#450a0a', borderColor: '#7f1d1d', color: '#fca5a5' }}>
        <span>
          📵 You're offline — showing cached data
          {cachedAt && <span style={{ opacity: 0.75, marginLeft: 6 }}>· last updated {cachedAt}</span>}
        </span>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div style={{ ...BANNER_BASE, background: '#0c4a6e', borderColor: '#075985', color: '#7dd3fc' }}>
        <span>🔄 A new version of SasyaMind is ready</span>
        <button
          onClick={applyUpdate}
          style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
        >
          Update now
        </button>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <div style={{ ...BANNER_BASE, background: '#052e16', borderColor: '#14532d', color: '#86efac' }}>
        <span>📲 Install SasyaMind for offline access &amp; faster load</span>
        <button
          onClick={promptInstall}
          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
        >
          Add to Home Screen
        </button>
      </div>
    );
  }

  return null;
}
