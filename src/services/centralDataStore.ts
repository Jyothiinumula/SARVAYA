import { CivicComplaint, CivicHotspot } from '../types';

const API_BASE = '/api';

/**
 * Fetch complaints & hotspots from the central shared server database
 */
export async function fetchCentralCivicData(): Promise<{
  complaints: CivicComplaint[];
  hotspots: CivicHotspot[];
  isOnline: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE}/sync`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        complaints: data.complaints || [],
        hotspots: data.hotspots || [],
        isOnline: true,
      };
    }
  } catch (err) {
    console.warn('[SARVAYA Central DB] Sync warning (using cached data):', err);
  }

  return {
    complaints: [],
    hotspots: [],
    isOnline: false,
  };
}

/**
 * Persist newly submitted citizen complaint to central server database
 */
export async function saveCentralComplaint(complaint: CivicComplaint): Promise<CivicComplaint> {
  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint),
    });
    if (res.ok) {
      const saved = await res.json();
      console.log('[SARVAYA Central DB] Complaint persisted centrally:', saved.id);
    }
  } catch (err) {
    console.error('[SARVAYA Central DB] Failed to POST complaint to server:', err);
  }
  return complaint;
}

/**
 * Update an existing complaint status, department, officer, or notes on central server
 */
export async function updateCentralComplaint(
  id: string,
  updates: Partial<CivicComplaint>
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      console.log(`[SARVAYA Central DB] Successfully updated ${id} on central server`);
      return true;
    }
  } catch (err) {
    console.error(`[SARVAYA Central DB] Error updating ${id}:`, err);
  }
  return false;
}

/**
 * Reset central demo data
 */
export async function resetCentralData(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.error('[SARVAYA Central DB] Failed to reset data:', err);
    return false;
  }
}
