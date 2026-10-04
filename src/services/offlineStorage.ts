/**
 * SARVAYA Local-First Offline Storage Engine
 * Uses IndexedDB for reliable offline persistence of high-resolution camera captures,
 * audio voice notes, drafts, outbox queue, and cached municipal dataset with localStorage fallback.
 */

import { CivicComplaint, CivicHotspot } from '../types';

const DB_NAME = 'sarvaya_local_db';
const DB_VERSION = 1;

const STORES = {
  DRAFTS: 'drafts',
  OUTBOX: 'outbox',
  CACHED_COMPLAINTS: 'cached_complaints',
  CACHED_HOTSPOTS: 'cached_hotspots',
};

export interface OfflineOutboxItem {
  id: string;
  report: CivicComplaint;
  enqueuedAt: string;
  retryCount: number;
  lastError?: string;
}

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in current environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        db.createObjectStore(STORES.DRAFTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.OUTBOX)) {
        db.createObjectStore(STORES.OUTBOX, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CACHED_COMPLAINTS)) {
        db.createObjectStore(STORES.CACHED_COMPLAINTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CACHED_HOTSPOTS)) {
        db.createObjectStore(STORES.CACHED_HOTSPOTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback to localStorage if IndexedDB is blocked or disabled
const LOCAL_STORAGE_KEYS = {
  DRAFTS: 'sarvaya_offline_drafts',
  OUTBOX: 'sarvaya_offline_outbox',
  CACHED_COMPLAINTS: 'sarvaya_cached_complaints',
  CACHED_HOTSPOTS: 'sarvaya_cached_hotspots',
};

// Generic read all from store
async function getAllFromStore<T>(storeName: string, fallbackKey: string): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(fallbackKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

// Generic put into store
async function putInStore<T extends { id: string }>(
  storeName: string,
  fallbackKey: string,
  item: T
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(fallbackKey);
      const items: T[] = saved ? JSON.parse(saved) : [];
      const idx = items.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        items[idx] = item;
      } else {
        items.unshift(item);
      }
      localStorage.setItem(fallbackKey, JSON.stringify(items));
    } catch (e) {
      console.warn('[OfflineStorage] Fallback storage notice:', e);
    }
  }
}

// Generic delete from store
async function deleteFromStore(
  storeName: string,
  fallbackKey: string,
  id: string
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    try {
      const saved = localStorage.getItem(fallbackKey);
      if (saved) {
        const items = JSON.parse(saved).filter((i: any) => i.id !== id);
        localStorage.setItem(fallbackKey, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('[OfflineStorage] Fallback delete notice:', e);
    }
  }
}

// Generic bulk put into store
async function bulkPutInStore<T extends { id: string }>(
  storeName: string,
  fallbackKey: string,
  items: T[]
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    try {
      localStorage.setItem(fallbackKey, JSON.stringify(items));
    } catch (e) {
      console.warn('[OfflineStorage] Fallback bulk put notice:', e);
    }
  }
}

// --- Public API for Drafts ---

export async function saveOfflineDraft(draft: CivicComplaint): Promise<void> {
  await putInStore(STORES.DRAFTS, LOCAL_STORAGE_KEYS.DRAFTS, draft);
}

export async function getOfflineDrafts(): Promise<CivicComplaint[]> {
  return getAllFromStore<CivicComplaint>(STORES.DRAFTS, LOCAL_STORAGE_KEYS.DRAFTS);
}

export async function deleteOfflineDraft(id: string): Promise<void> {
  await deleteFromStore(STORES.DRAFTS, LOCAL_STORAGE_KEYS.DRAFTS, id);
}

// --- Public API for Offline Outbox (Completed reports submitted while offline) ---

export async function enqueueOfflineReport(report: CivicComplaint): Promise<OfflineOutboxItem> {
  const item: OfflineOutboxItem = {
    id: report.id,
    report,
    enqueuedAt: new Date().toISOString(),
    retryCount: 0,
  };
  await putInStore(STORES.OUTBOX, LOCAL_STORAGE_KEYS.OUTBOX, item);
  return item;
}

export async function getOfflineOutbox(): Promise<OfflineOutboxItem[]> {
  return getAllFromStore<OfflineOutboxItem>(STORES.OUTBOX, LOCAL_STORAGE_KEYS.OUTBOX);
}

export async function removeOfflineOutboxItem(id: string): Promise<void> {
  await deleteFromStore(STORES.OUTBOX, LOCAL_STORAGE_KEYS.OUTBOX, id);
}

export async function updateOfflineOutboxItem(item: OfflineOutboxItem): Promise<void> {
  await putInStore(STORES.OUTBOX, LOCAL_STORAGE_KEYS.OUTBOX, item);
}

// --- Public API for Cached Complaints & Hotspots ---

export async function cacheComplaintsLocally(complaints: CivicComplaint[]): Promise<void> {
  await bulkPutInStore(STORES.CACHED_COMPLAINTS, LOCAL_STORAGE_KEYS.CACHED_COMPLAINTS, complaints);
}

export async function getCachedComplaints(): Promise<CivicComplaint[]> {
  return getAllFromStore<CivicComplaint>(STORES.CACHED_COMPLAINTS, LOCAL_STORAGE_KEYS.CACHED_COMPLAINTS);
}

export async function cacheHotspotsLocally(hotspots: CivicHotspot[]): Promise<void> {
  await bulkPutInStore(STORES.CACHED_HOTSPOTS, LOCAL_STORAGE_KEYS.CACHED_HOTSPOTS, hotspots);
}

export async function getCachedHotspots(): Promise<CivicHotspot[]> {
  return getAllFromStore<CivicHotspot>(STORES.CACHED_HOTSPOTS, LOCAL_STORAGE_KEYS.CACHED_HOTSPOTS);
}
