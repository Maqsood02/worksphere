// IndexedDB Persistent Storage & Cloud Media Sync for Large Deliverables (Videos, ZIPs, Proof Images)
// Bypasses localStorage 5MB quota and seamlessly syncs large deliverables via chunking

const DB_NAME = 'worksphere_deliverables_db';
const DB_VERSION = 1;
const STORE_NAME = 'deliverable_assets';
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunk size for Vercel 4.5MB limit safety

function openDB() {
  return new Promise((resolve) => {
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
    if (!db || !data) return false;
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
    if (!db || !taskId) return null;
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

// Upload chunks to Serverless MongoDB
async function uploadMediaChunks(taskId, assetType, data, metadata = {}) {
  if (!taskId || !data || data.length < 50) return;
  const totalLength = data.length;
  const totalChunks = Math.ceil(totalLength / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const chunkData = data.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const payload = {
      taskId: String(taskId),
      assetType,
      chunkIndex: i,
      totalChunks,
      data: chunkData,
      fileName: metadata.name || '',
      fileSize: metadata.size || ''
    };

    try {
      let res = await fetch('/api/task-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        await fetch('https://worksphere-two.vercel.app/api/task-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (e) {
      try {
        await fetch('https://worksphere-two.vercel.app/api/task-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}
    }
  }
}

// Fetch chunks from Serverless MongoDB
async function fetchMediaFromCloud(taskId, assetType = 'video') {
  if (!taskId) return null;
  const url = `/api/task-media?taskId=${encodeURIComponent(taskId)}&assetType=${encodeURIComponent(assetType)}`;
  const remoteUrl = `https://worksphere-two.vercel.app${url}`;

  try {
    let res = await fetch(url);
    if (!res.ok) res = await fetch(remoteUrl);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    try {
      const res = await fetch(remoteUrl);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) return json.data;
      }
    } catch (err) {}
  }
  return null;
}

export async function saveDeliverableVideo(taskId, videoData, metadata = {}) {
  if (!videoData) return false;
  const cleanId = String(taskId || 'latest').trim();
  const aliasKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase(), 'latest', metadata.name].filter(Boolean);

  // 1. Save to local IndexedDB under all aliases for instant 0ms retrieval
  for (const k of aliasKeys) {
    await saveDeliverableAsset(k, 'video', videoData);
  }

  // 2. Upload chunks to cloud in background for cross-device visibility
  uploadMediaChunks(cleanId, 'video', videoData, metadata).catch(() => {});
  return true;
}

export async function getDeliverableVideo(taskId, fileName = '') {
  const cleanId = String(taskId || '').trim();
  const aliasKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase(), fileName, 'latest'].filter(Boolean);

  // 1. Try local IndexedDB first
  for (const k of aliasKeys) {
    const localData = await getDeliverableAsset(k, 'video');
    if (localData && localData.length > 50) return localData;
  }

  // 2. Fallback to Serverless MongoDB Atlas chunked storage
  if (cleanId && cleanId !== 'latest') {
    const cloudData = await fetchMediaFromCloud(cleanId, 'video');
    if (cloudData && cloudData.length > 50) {
      // Cache into local IndexedDB
      saveDeliverableAsset(cleanId, 'video', cloudData).catch(() => {});
      return cloudData;
    }
  }

  return null;
}
