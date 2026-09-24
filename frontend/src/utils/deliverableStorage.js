// IndexedDB Persistent Storage & Cloud Media Sync for Large Deliverables (Videos, ZIPs, Proof Images)
// Supports files from 1MB up to 500MB via memory-safe File.slice chunking, bypassing Vercel 4.5MB limits.

const DB_NAME = 'worksphere_deliverables_v4';
const DB_VERSION = 1;
const STORE_NAME = 'deliverable_assets';
const BINARY_CHUNK_SIZE = 1.25 * 1024 * 1024; // 1.25 MB binary -> ~1.66 MB base64 (strictly under Vercel 4.5MB limit and within serverless function timeouts)

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 1200);

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = (e) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(e.target.result);
        }
      };
      request.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      };
      request.onblocked = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      };
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

export async function saveDeliverableAsset(taskId, assetKey, data) {
  try {
    const db = await openDB();
    if (!db || !data) return false;
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 1500);

      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const key = `${taskId}_${assetKey}`;
        store.put({ key, taskId, assetKey, data, updatedAt: Date.now() });
        tx.oncomplete = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(true);
          }
        };
        tx.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(false);
          }
        };
      } catch {
        clearTimeout(timer);
        resolve(false);
      }
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
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 1200);

      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const key = `${taskId}_${assetKey}`;
        const req = store.get(key);
        req.onsuccess = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            const val = req.result ? req.result.data : null;
            if (val && typeof Blob !== 'undefined' && val instanceof Blob) {
              resolve(URL.createObjectURL(val));
            } else {
              resolve(val);
            }
          }
        };
        req.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(null);
          }
        };
      } catch {
        clearTimeout(timer);
        resolve(null);
      }
    });
  } catch (err) {
    console.warn('Error getting from IndexedDB:', err);
    return null;
  }
}

// Convert a single Blob slice to base64 Data URL (memory-safe, max 2MB in RAM)
function readBlobSliceAsDataUrl(blobSlice) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blobSlice);
  });
}

// Helper to post a chunk with retry and timeout
async function postChunkWithRetry(payload, maxRetries = 5) {
  const jsonBody = JSON.stringify(payload);
  const endpoints = ['/api/task-media', 'https://worksphere-two.vercel.app/api/task-media'];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout per chunk
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonBody,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) return true;
      } catch (e) {
        // Fallback to next endpoint
      }
    }
    // Exponential backoff wait before next retry
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  return false;
}

// Memory-Safe Resumable Chunk Uploader: Works with File objects up to 500MB without filling phone/browser RAM
export async function uploadFileChunks(fileOrBlob, taskId, assetType = 'video', metadata = {}, onProgress = null) {
  if (!taskId || !fileOrBlob) return false;
  const cleanId = String(taskId).trim();
  const totalBytes = fileOrBlob.size || 0;
  if (totalBytes === 0) return false;

  const totalChunks = Math.ceil(totalBytes / BINARY_CHUNK_SIZE);
  const fileName = metadata.name || fileOrBlob.name || 'deliverable.mp4';
  const fileSizeStr = metadata.size || (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';

  // 1. Check existing chunks to avoid re-uploading and support instant resuming
  const existingChunks = new Set();
  try {
    let manifestRes = await fetch(`/api/task-media?taskId=${encodeURIComponent(cleanId)}&assetType=${encodeURIComponent(assetType)}`);
    if (!manifestRes.ok) manifestRes = await fetch(`https://worksphere-two.vercel.app/api/task-media?taskId=${encodeURIComponent(cleanId)}&assetType=${encodeURIComponent(assetType)}`);
    if (manifestRes.ok) {
      const manifest = await manifestRes.json();
      if (manifest && Array.isArray(manifest.existingChunks)) {
        manifest.existingChunks.forEach(i => existingChunks.add(Number(i)));
      }
    }
  } catch (e) {}

  // 2. Upload chunk-by-chunk using File.slice with concurrency (2 parallel transfers)
  let uploadedCount = existingChunks.size;
  if (typeof onProgress === 'function' && uploadedCount > 0) {
    onProgress(Math.round((uploadedCount / totalChunks) * 100), uploadedCount, totalChunks);
  }

  const CONCURRENCY = 2;
  for (let i = 0; i < totalChunks; i += CONCURRENCY) {
    const batch = [];
    for (let c = i; c < Math.min(i + CONCURRENCY, totalChunks); c++) {
      if (existingChunks.has(c)) continue; // Skip already uploaded chunk

      batch.push((async (chunkIdx) => {
        const startByte = chunkIdx * BINARY_CHUNK_SIZE;
        const endByte = Math.min(startByte + BINARY_CHUNK_SIZE, totalBytes);
        const slice = fileOrBlob.slice(startByte, endByte);
        const sliceDataUrl = await readBlobSliceAsDataUrl(slice);
        const payload = {
          taskId: cleanId,
          assetType,
          chunkIndex: chunkIdx,
          totalChunks,
          data: sliceDataUrl,
          fileName,
          fileSize: fileSizeStr
        };
        const ok = await postChunkWithRetry(payload, 5);
        if (!ok) {
          console.warn(`Chunk ${chunkIdx + 1}/${totalChunks} upload retry limit reached.`);
        } else {
          uploadedCount++;
          if (typeof onProgress === 'function') {
            const pct = Math.round((uploadedCount / totalChunks) * 100);
            onProgress(pct, uploadedCount, totalChunks);
          }
        }
      })(c));
    }
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  }

  return true;
}

// Chunked Cloud Fetcher: Downloads chunks individually to avoid Vercel 4.5MB payload limit
export async function fetchMediaFromCloud(taskId, assetType = 'video', onProgress = null) {
  if (!taskId) return null;
  const cleanId = String(taskId).trim();
  const queryParam = `taskId=${encodeURIComponent(cleanId)}&assetType=${encodeURIComponent(assetType)}`;
  const getUrl = (extra = '') => `/api/task-media?${queryParam}${extra}`;
  const getRemoteUrl = (extra = '') => `https://worksphere-two.vercel.app/api/task-media?${queryParam}${extra}`;

  // 1. Fetch manifest
  let manifest = null;
  try {
    let res = await fetch(getUrl());
    if (!res.ok) res = await fetch(getRemoteUrl());
    if (res.ok) {
      manifest = await res.json();
    }
  } catch (e) {}

  if (!manifest || !manifest.success) {
    return null;
  }

  // If single chunk with data directly attached (small files)
  if (manifest.data && manifest.totalChunks === 1) {
    if (typeof manifest.data === 'string' && manifest.data.startsWith('data:')) {
      try {
        const base64Index = manifest.data.indexOf(',');
        const rawBase64 = base64Index >= 0 ? manifest.data.substring(base64Index + 1) : manifest.data;
        const binaryString = atob(rawBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        const mime = assetType === 'folder' ? 'application/zip' : 'video/mp4';
        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        saveDeliverableAsset(cleanId, assetType, blob).catch(() => {});
        return blobUrl;
      } catch (e) {
        return manifest.data;
      }
    }
    return manifest.data;
  }

  const totalChunks = Number(manifest.totalChunks || 1);
  const chunkParts = new Array(totalChunks);

  // 2. Fetch chunks with concurrency (3 parallel chunk requests)
  let downloadedCount = 0;
  const FETCH_CONCURRENCY = 3;
  for (let i = 0; i < totalChunks; i += FETCH_CONCURRENCY) {
    const batch = [];
    for (let c = i; c < Math.min(i + FETCH_CONCURRENCY, totalChunks); c++) {
      batch.push((async (chunkIdx) => {
        let chunkJson = null;
        try {
          let chunkRes = await fetch(getUrl(`&chunkIndex=${chunkIdx}`));
          if (!chunkRes.ok) chunkRes = await fetch(getRemoteUrl(`&chunkIndex=${chunkIdx}`));
          if (chunkRes.ok) {
            chunkJson = await chunkRes.json();
          }
        } catch (e) {}

        if (chunkJson && chunkJson.data) {
          chunkParts[chunkIdx] = chunkJson.data;
        } else {
          console.warn(`Missing chunk ${chunkIdx} for task ${taskId}`);
          throw new Error(`Missing chunk ${chunkIdx}`);
        }

        downloadedCount++;
        if (typeof onProgress === 'function') {
          const pct = Math.round((downloadedCount / totalChunks) * 100);
          onProgress(pct, downloadedCount, totalChunks);
        }
      })(c));
    }
    try {
      await Promise.all(batch);
    } catch (batchErr) {
      console.warn('Batch chunk download failed:', batchErr);
      return null;
    }
  }

  // 3. Combine chunks into binary Blob
  try {
    const byteArrays = [];
    for (let i = 0; i < chunkParts.length; i++) {
      const part = chunkParts[i];
      if (!part) continue;
      // Extract pure base64 string
      const base64Index = part.indexOf(',');
      const rawBase64 = base64Index >= 0 ? part.substring(base64Index + 1) : part;
      const binaryString = atob(rawBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let j = 0; j < len; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      byteArrays.push(bytes);
    }

    const mime = assetType === 'folder' ? 'application/zip' : 'video/mp4';
    const combinedBlob = new Blob(byteArrays, { type: mime });
    const blobUrl = URL.createObjectURL(combinedBlob);

    // Also store binary Blob into IndexedDB for instant 0ms retrieval next time
    saveDeliverableAsset(cleanId, assetType, combinedBlob).catch(() => {});

    return blobUrl;
  } catch (combineErr) {
    console.warn('Error combining binary chunks:', combineErr);
    return null;
  }
}

export async function saveDeliverableVideo(taskId, videoSource, metadata = {}, onProgress = null) {
  if (!videoSource) return false;
  const cleanId = String(taskId || 'latest').trim();
  const aliasKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase(), 'latest', metadata.name].filter(Boolean);

// A. If videoSource is a File or Blob (Memory-safe for 100MB - 500MB)
  if (typeof Blob !== 'undefined' && videoSource instanceof Blob) {
    // Save raw Blob directly to IndexedDB locally without converting to base64 RAM
    for (const k of aliasKeys) {
      saveDeliverableAsset(k, 'video', videoSource).catch(() => {});
    }

    // Upload chunks safely using File.slice
    try {
      await uploadFileChunks(videoSource, cleanId, 'video', metadata, onProgress);
    } catch (err) {
      console.warn('Cloud video sync error:', err);
    }
    return true;
  }

  // B. If videoSource is a Data URL string
  for (const k of aliasKeys) {
    await saveDeliverableAsset(k, 'video', videoSource).catch(() => {});
  }

  try {
    // Convert data URL to Blob for slice chunking
    const res = await fetch(videoSource);
    const blob = await res.blob();
    await uploadFileChunks(blob, cleanId, 'video', metadata, onProgress);
  } catch (err) {
    console.warn('Cloud video sync error:', err);
  }
  return true;
}

export async function getDeliverableVideo(taskId, fileName = '', onProgress = null) {
  const cleanId = String(taskId || '').trim();
  const aliasKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase(), fileName, 'latest'].filter(Boolean);

  // 1. Try local IndexedDB first (0ms instantaneous)
  try {
    for (const k of aliasKeys) {
      const localData = await getDeliverableAsset(k, 'video');
      if (localData) {
        if (typeof Blob !== 'undefined' && localData instanceof Blob) {
          return URL.createObjectURL(localData);
        }
        if (typeof localData === 'string') {
          if (localData.startsWith('blob:')) {
            return localData;
          }
          if ((localData.startsWith('http://') || localData.startsWith('https://')) && !localData.startsWith('data:')) {
            return localData;
          }
          if (localData.startsWith('data:')) {
            try {
              const base64Index = localData.indexOf(',');
              const rawBase64 = base64Index >= 0 ? localData.substring(base64Index + 1) : localData;
              const binaryString = atob(rawBase64);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let j = 0; j < len; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              const mp4Blob = new Blob([bytes], { type: 'video/mp4' });
              return URL.createObjectURL(mp4Blob);
            } catch (convErr) {
              console.warn('Failed to parse local data-URL, falling back to MongoDB Atlas chunks:', convErr);
            }
          }
        }
      }
    }
  } catch (e) {}

  // 2. Fallback to Serverless MongoDB Atlas chunk-by-chunk streaming
  if (cleanId && cleanId !== 'latest') {
    try {
      const cloudData = await fetchMediaFromCloud(cleanId, 'video', onProgress);
      if (cloudData) {
        return cloudData;
      }
    } catch (e) {}
  }

  return null;
}

export async function saveDeliverableFolder(taskId, folderSource, metadata = {}, onProgress = null) {
  if (!folderSource) return false;
  const cleanId = String(taskId || 'latest').trim();
  const aliasKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase(), 'latest', metadata.name].filter(Boolean);

  if (typeof Blob !== 'undefined' && folderSource instanceof Blob) {
    for (const k of aliasKeys) {
      saveDeliverableAsset(k, 'folder', folderSource).catch(() => {});
    }
    try {
      await uploadFileChunks(folderSource, cleanId, 'folder', metadata, onProgress);
    } catch (err) {
      console.warn('Cloud folder sync error:', err);
    }
    return true;
  }

  for (const k of aliasKeys) {
    await saveDeliverableAsset(k, 'folder', folderSource).catch(() => {});
  }

  try {
    const res = await fetch(folderSource);
    const blob = await res.blob();
    await uploadFileChunks(blob, cleanId, 'folder', metadata, onProgress);
  } catch (err) {
    console.warn('Cloud folder sync error:', err);
  }
  return true;
}

export async function getDeliverableFolder(taskId, fileName = '', onProgress = null) {
  const cleanId = String(taskId || '').trim();
  const aliasKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase(), fileName, 'latest'].filter(Boolean);

  // 1. Try local IndexedDB first
  try {
    for (const k of aliasKeys) {
      const localData = await getDeliverableAsset(k, 'folder');
      if (localData) {
        if (typeof Blob !== 'undefined' && localData instanceof Blob) {
          return URL.createObjectURL(localData);
        }
        if (typeof localData === 'string' && (localData.startsWith('blob:') || localData.startsWith('data:'))) {
          return localData;
        }
      }
    }
  } catch (e) {}

  // 2. Fallback to Serverless MongoDB Atlas chunk-by-chunk streaming
  if (cleanId && cleanId !== 'latest') {
    try {
      const cloudData = await fetchMediaFromCloud(cleanId, 'folder', onProgress);
      if (cloudData) {
        return cloudData;
      }
    } catch (e) {}
  }
  return null;
}

// Robust browser-native binary blob downloader (bypasses Chrome data-URI limits)
export async function downloadDeliverableVideo(videoSrc, fileName = 'walkthrough.mp4') {
  if (!videoSrc) return false;
  try {
    let blob;
    if (videoSrc.startsWith('blob:')) {
      const res = await fetch(videoSrc);
      blob = await res.blob();
    } else if (videoSrc.startsWith('data:')) {
      const res = await fetch(videoSrc);
      blob = await res.blob();
    } else if (videoSrc.startsWith('http')) {
      const a = document.createElement('a');
      a.href = videoSrc;
      a.target = '_blank';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } else {
      blob = new Blob([videoSrc], { type: 'video/mp4' });
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName.toLowerCase().endsWith('.mp4') || fileName.toLowerCase().endsWith('.webm') ? fileName : `${fileName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    return true;
  } catch (err) {
    console.error('Download video helper error:', err);
    window.open(videoSrc, '_blank');
    return false;
  }
}

