import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

let cachedCredentials = null;

// Load credentials from in-memory cache, env vars, MongoDB app_settings, or local JSON file
export async function getCredentials(db = null) {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // 1. Try environment variables
  if (process.env.GDRIVE_CLIENT_EMAIL && process.env.GDRIVE_PRIVATE_KEY) {
    cachedCredentials = {
      client_email: process.env.GDRIVE_CLIENT_EMAIL,
      private_key: process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      folder_id: process.env.GDRIVE_FOLDER_ID || null
    };
    return cachedCredentials;
  }

  // 2. Try MongoDB app_settings (key: 'gdrive_credentials')
  if (db) {
    try {
      const setting = await db.collection('app_settings').findOne({ key: 'gdrive_credentials' });
      if (setting && setting.client_email && setting.private_key) {
        cachedCredentials = {
          client_email: setting.client_email,
          private_key: setting.private_key.replace(/\\n/g, '\n'),
          folder_id: setting.folder_id || null
        };
        return cachedCredentials;
      }
    } catch (dbErr) {
      console.warn('Could not read gdrive_credentials from MongoDB:', dbErr.message);
    }
  }

  // 3. Try service_account.json in root, api, or current working directory
  const possiblePaths = [
    path.resolve(process.cwd(), 'service_account.json'),
    path.resolve(process.cwd(), 'credentials.json'),
    path.resolve(process.cwd(), 'api/service_account.json'),
    path.resolve(process.cwd(), 'backend/service_account.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const json = JSON.parse(raw);
        if (json.client_email && json.private_key) {
          cachedCredentials = {
            client_email: json.client_email,
            private_key: json.private_key,
            folder_id: process.env.GDRIVE_FOLDER_ID || json.folder_id || null
          };
          return cachedCredentials;
        }
      } catch (e) {
        console.warn('Failed to parse service account JSON at:', p, e.message);
      }
    }
  }

  return null;
}

export async function isGoogleDriveConfigured(db = null) {
  const creds = await getCredentials(db);
  return Boolean(creds && creds.client_email && creds.private_key);
}

export async function getGoogleDriveAuth(db = null) {
  const creds = await getCredentials(db);
  if (!creds) return null;

  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
}

// Verify that credentials can successfully obtain an access token and communicate with Google Drive
export async function verifyGoogleDriveCredentials(creds) {
  if (!creds || !creds.client_email || !creds.private_key) {
    return { valid: false, error: 'Missing client_email or private_key in credentials.' };
  }

  try {
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const tokenRes = await auth.authorize();
    if (!tokenRes || !tokenRes.access_token) {
      return { valid: false, error: 'Google did not grant an access token. Check private key format.' };
    }

    const drive = google.drive({ version: 'v3', auth });
    const about = await drive.about.get({ fields: 'user, storageQuota' });

    return {
      valid: true,
      client_email: creds.client_email,
      user: about.data.user,
      storageQuota: about.data.storageQuota
    };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Save credentials to MongoDB and locally, verifying first
export async function saveGoogleDriveCredentials(newCreds, db = null) {
  const verification = await verifyGoogleDriveCredentials(newCreds);
  if (!verification.valid) {
    throw new Error(`Google Drive verification failed: ${verification.error}`);
  }

  const payload = {
    key: 'gdrive_credentials',
    client_email: newCreds.client_email,
    private_key: newCreds.private_key.replace(/\\n/g, '\n'),
    folder_id: newCreds.folder_id || null,
    updatedAt: new Date()
  };

  if (db) {
    await db.collection('app_settings').updateOne(
      { key: 'gdrive_credentials' },
      { $set: payload },
      { upsert: true }
    );
  }

  try {
    const targetPath = path.resolve(process.cwd(), 'service_account.json');
    fs.writeFileSync(targetPath, JSON.stringify(newCreds, null, 2), 'utf8');
  } catch (fsErr) {
    // Non-fatal if filesystem is read-only (e.g. Vercel serverless)
  }

  cachedCredentials = {
    client_email: payload.client_email,
    private_key: payload.private_key,
    folder_id: payload.folder_id
  };

  return { success: true, client_email: payload.client_email };
}

// 1. Initiate a Resumable Upload directly from browser to Google Drive
export async function createResumableUploadUrl({ fileName, mimeType, fileSize, customFolderId, origin, db = null }) {
  const creds = await getCredentials(db);
  if (!creds) {
    throw new Error('Google Drive Service Account is not configured. Please supply service_account.json, env vars, or configure in Admin settings.');
  }

  const auth = await getGoogleDriveAuth(db);
  const authClient = await auth.getClient();
  const folderId = customFolderId || creds.folder_id;

  const metadata = {
    name: fileName,
    description: 'Uploaded directly via WorkSphere Intern Portal',
    parents: folderId ? [folderId] : undefined
  };

  const reqHeaders = {
    'X-Upload-Content-Type': mimeType || 'application/octet-stream',
    'X-Upload-Content-Length': String(fileSize || 0)
  };

  // If origin is provided by browser, pass it to Google Drive so Google sets Access-Control-Allow-Origin
  if (origin) {
    reqHeaders['Origin'] = origin;
  }

  const response = await authClient.request({
    method: 'POST',
    url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    headers: reqHeaders,
    data: metadata
  });

  const uploadUrl = response.headers.location;
  if (!uploadUrl) {
    throw new Error('Google Drive did not return a resumable upload location header.');
  }

  return { uploadUrl, folderId };
}

// 2. Finalize permissions and generate shareable links once browser finishes uploading
export async function finalizeDriveFile(fileId, db = null) {
  const auth = await getGoogleDriveAuth(db);
  if (!auth) {
    throw new Error('Google Drive Service Account not configured');
  }

  const drive = google.drive({ version: 'v3', auth });

  // Make file viewable by anyone with link
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
  } catch (permErr) {
    console.warn('Google Drive permission warning:', permErr.message);
  }

  // Get web links
  const fileRes = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink'
  });

  const file = fileRes.data;
  return {
    fileId: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size,
    webViewLink: file.webViewLink,
    webContentLink: file.webContentLink,
    embedUrl: `https://drive.google.com/file/d/${file.id}/preview`
  };
}
