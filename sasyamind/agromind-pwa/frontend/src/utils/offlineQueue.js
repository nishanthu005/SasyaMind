/**
 * offlineQueue.js
 * Drop this in src/utils/offlineQueue.js
 *
 * Usage:
 *   import { queueRequest, flushQueue } from '../utils/offlineQueue';
 *
 *   // Instead of calling the API directly when offline:
 *   if (!navigator.onLine) {
 *     await queueRequest({ url: '/api/irrigation', method: 'POST', body: data });
 *     return { queued: true };
 *   }
 *
 * The queue is stored in localStorage and replayed when the user comes back online.
 * For sensor readings that shouldn't pile up, use dedupeKey to replace old entries.
 */

const QUEUE_KEY = 'sasyamind_offline_queue';

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Add a request to the offline queue.
 * @param {object} entry
 * @param {string} entry.url         - Relative API path, e.g. '/api/irrigation'
 * @param {string} entry.method      - HTTP method, default 'POST'
 * @param {object} entry.body        - Request body (will be JSON-stringified)
 * @param {string} [entry.dedupeKey] - If set, replaces any existing entry with same key
 */
export function queueRequest({ url, method = 'POST', body, dedupeKey }) {
  const queue = readQueue();
  const entry = { url, method, body, dedupeKey, queuedAt: new Date().toISOString() };

  if (dedupeKey) {
    const idx = queue.findIndex(e => e.dedupeKey === dedupeKey);
    if (idx >= 0) { queue[idx] = entry; }
    else          { queue.push(entry); }
  } else {
    queue.push(entry);
  }

  writeQueue(queue);

  // Register a Background Sync if supported (Chrome/Edge only)
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(reg => reg.sync.register('sync-pending-requests'))
      .catch(() => {});  // silently ignore — we'll flush on next online event instead
  }

  return entry;
}

/**
 * Replay all queued requests against the live API.
 * Called automatically when the 'online' event fires.
 * Returns an array of { entry, ok, status } results.
 */
export async function flushQueue() {
  const queue = readQueue();
  if (queue.length === 0) return [];

  const results = [];

  for (const entry of queue) {
    try {
      const response = await fetch(entry.url, {
        method:  entry.method,
        headers: { 'Content-Type': 'application/json' },
        body:    entry.body ? JSON.stringify(entry.body) : undefined,
      });
      results.push({ entry, ok: response.ok, status: response.status });
    } catch (err) {
      results.push({ entry, ok: false, error: err.message });
    }
  }

  // Remove successfully replayed requests; keep failed ones for next attempt
  const failed = results.filter(r => !r.ok).map(r => r.entry);
  writeQueue(failed);

  return results;
}

export function getQueueLength() {
  return readQueue().length;
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}


// ── Auto-flush on reconnect ───────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const results = await flushQueue();
    if (results.length > 0) {
      const successful = results.filter(r => r.ok).length;
      console.info(`[SasyaMind] Flushed ${successful}/${results.length} queued requests after reconnect`);
      // Dispatch a custom event so React components can refresh their data
      window.dispatchEvent(new CustomEvent('sasyamind:queue-flushed', { detail: { results } }));
    }
  });
}
