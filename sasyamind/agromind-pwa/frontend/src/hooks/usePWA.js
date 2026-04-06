/**
 * usePWA.js
 * Drop this in src/hooks/usePWA.js
 *
 * Provides:
 *   isOnline        — live network status
 *   isInstallable   — true when the browser has an install prompt ready
 *   isInstalled     — true when running in standalone (already installed)
 *   promptInstall() — call to show the native "Add to Home Screen" dialog
 *   swStatus        — 'installing' | 'waiting' | 'active' | 'unsupported'
 *   updateAvailable — true when a new SW is waiting
 *   applyUpdate()   — tell the waiting SW to take over immediately
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePWA() {
  const [isOnline,       setIsOnline]       = useState(navigator.onLine);
  const [isInstallable,  setIsInstallable]  = useState(false);
  const [isInstalled,    setIsInstalled]    = useState(
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
  const [swStatus,       setSwStatus]       = useState('unsupported');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const deferredPromptRef = useRef(null);
  const swRegistrationRef = useRef(null);

  // ── Online / offline ────────────────────────────────────────────────────────
  useEffect(() => {
    const online  = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // ── Install prompt ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      e.preventDefault();             // stop the default mini-infobar
      deferredPromptRef.current = e;
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installed = () => setIsInstalled(true);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPromptRef.current) return false;
    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    deferredPromptRef.current = null;
    setIsInstallable(false);
    return outcome === 'accepted';
  }, []);

  // ── Service Worker registration ─────────────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        swRegistrationRef.current = registration;

        if (registration.installing) setSwStatus('installing');
        else if (registration.waiting) { setSwStatus('waiting'); setUpdateAvailable(true); }
        else if (registration.active)  setSwStatus('active');

        registration.addEventListener('updatefound', () => {
          const newSW = registration.installing;
          setSwStatus('installing');
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              setSwStatus('waiting');
              setUpdateAvailable(true);
            } else if (newSW.state === 'activated') {
              setSwStatus('active');
            }
          });
        });
      })
      .catch(err => console.error('[SasyaMind SW] Registration failed:', err));

    // Listen for messages from the SW (e.g. SYNC_COMPLETE)
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        window.dispatchEvent(new CustomEvent('sasyamind:sync-complete'));
      }
    });
  }, []);

  const applyUpdate = useCallback(() => {
    const reg = swRegistrationRef.current;
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      window.location.reload();
    }
  }, []);

  return { isOnline, isInstallable, isInstalled, promptInstall, swStatus, updateAvailable, applyUpdate };
}
