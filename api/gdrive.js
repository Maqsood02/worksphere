import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

let cachedCredentials = null;

// Load credentials from in-memory cache, env vars, MongoDB app_settings, or local JSON files
export async function getCredentials(db = null) {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // 1. Try environment variables (OAuth or Service Account)
  if (process.env.GDRIVE_REFRESH_TOKEN && process.env.GDRIVE_CLIENT_ID) {
    cachedCredentials = {
      type: 'authorized_user',
      client_id: process.env.GDRIVE_CLIENT_ID,
      client_secret: process.env.GDRIVE_CLIENT_SECRET,
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
      folder_id: process.env.GDRIVE_FOLDER_ID || null
    };
    return cachedCredentials;
  }

  if (process.env.GDRIVE_CLIENT_EMAIL && process.env.GDRIVE_PRIVATE_KEY) {
    cachedCredentials = {
      type: 'service_account',
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
      if (setting) {
        if (setting.refresh_token && setting.client_id) {
          cachedCredentials = {
            type: 'authorized_user',
            client_id: setting.client_id,
            client_secret: setting.client_secret,
            refresh_token: setting.refresh_token,
            folder_id: setting.folder_id || null
          };
          return cachedCredentials;
        }
        if (setting.client_email && setting.private_key) {
          cachedCredentials = {
            type: 'service_account',
            client_email: setting.client_email,
            private_key: setting.private_key.replace(/\\n/g, '\n'),
            folder_id: setting.folder_id || null
          };
          return cachedCredentials;
        }
      }
    } catch (dbErr) {
      console.warn('Could not read gdrive_credentials from MongoDB:', dbErr.message);
    }
  }

  // 3. Try local oauth_credentials.json (User 15 GB account)
  const oauthPaths = [
    path.resolve(process.cwd(), 'oauth_credentials.json'),
    path.resolve(process.cwd(), 'api/oauth_credentials.json')
  ];
  for (const p of oauthPaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const json = JSON.parse(raw);
        if (json.refresh_token && json.client_id) {
          cachedCredentials = {
            type: 'authorized_user',
            client_id: json.client_id,
            client_secret: json.client_secret,
            refresh_token: json.refresh_token,
            folder_id: json.folder_id || null
          };
          return cachedCredentials;
        }
      } catch (e) {
        console.warn('Failed to parse oauth_credentials.json at:', p, e.message);
      }
    }
  }

  // 4. Try service_account.json
  const serviceAccountPaths = [
    path.resolve(process.cwd(), 'service_account.json'),
    path.resolve(process.cwd(), 'credentials.json'),
    path.resolve(process.cwd(), 'api/service_account.json')
  ];
  for (const p of serviceAccountPaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const json = JSON.parse(raw);
        if (json.client_email && json.private_key) {
          cachedCredentials = {
            type: 'service_account',
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
  if (!creds) return false;
  return Boolean(
    (creds.client_id && creds.refresh_token) || 
    (creds.client_email && creds.private_key)
  );
}

export async function getGoogleDriveAuth(db = null) {
  const creds = await getCredentials(db);
  if (!creds) return null;

  // Option 1: OAuth 2.0 User (Consumes user's 15 GB quota without limit issues)
  if (creds.client_id && creds.client_secret && creds.refresh_token) {
    const oauth2Client = new google.auth.OAuth2(
      creds.client_id,
      creds.client_secret,
      'http://127.0.0.1:54321'
    );
    oauth2Client.setCredentials({ refresh_token: creds.refresh_token });
    return oauth2Client;
  }

  // Option 2: Service Account JWT
  if (creds.client_email && creds.private_key) {
    return new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
  }

  return null;
}

// 1. Initiate a Resumable Upload directly from browser to Google Drive
export async function createResumableUploadUrl({ fileName, mimeType, fileSize, customFolderId, origin, db = null }) {
  const creds = await getCredentials(db);
  if (!creds) {
    throw new Error('Google Drive is not configured. Please connect Google Drive in Admin settings.');
  }

  const authClient = await getGoogleDriveAuth(db);
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
    url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
    headers: reqHeaders,
    data: metadata
  });

  const uploadUrl = response.headers?.location || 
                    response.headers?.['location'] || 
                    (response.headers?.get ? response.headers.get('location') : null);

  if (!uploadUrl) {
    throw new Error('Google Drive did not return a resumable upload location header.');
  }

  return { uploadUrl, folderId };
}

// 2. Finalize permissions and generate shareable links once browser finishes uploading
export async function finalizeDriveFile(fileId, db = null) {
  const auth = await getGoogleDriveAuth(db);
  if (!auth) {
    throw new Error('Google Drive credentials not available');
  }

  const drive = google.drive({ version: 'v3', auth });

  // Make file viewable by anyone with link
  try {
    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
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
    supportsAllDrives: true,
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
