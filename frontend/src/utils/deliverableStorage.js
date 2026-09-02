// IndexedDB Persistent Storage for Large Deliverables (Videos, ZIPs, Proof Images)
// Bypasses localStorage 5MB quota and prevents network 413 Payload Too Large errors

const DB_NAME = 'worksphere_deliverables_db';
const DB_VERSION = 1;
const STORE_NAME = 'deliverable_assets';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => {
      console.warn('IndexedDB open error:', e);
      resolve(null);
    };
  });
}

export async function saveDeliverableAsset(taskId, assetKey, data) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const key = `${taskId}_${assetKey}`;
      store.put({ key, taskId, assetKey, data, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Error saving to IndexedDB:', err);
    return false;
  }
}

export async function getDeliverableAsset(taskId, assetKey) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const key = `${taskId}_${assetKey}`;
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Error getting from IndexedDB:', err);
    return null;
  }
}

export async function saveDeliverableVideo(taskId, videoData) {
  return saveDeliverableAsset(taskId, 'video', videoData);
}

export async function getDeliverableVideo(taskId) {
  return getDeliverableAsset(taskId, 'video');
}
