import http from 'http';
import url from 'url';
import fs from 'fs';
import { google } from 'googleapis';
import { connectToDatabase } from '../api/db.js';

const oauth = JSON.parse(fs.readFileSync('./oauth_credentials.json', 'utf8'));
const oauth2Client = new google.auth.OAuth2(
  oauth.client_id,
  oauth.client_secret,
  'http://127.0.0.1:54321'
);

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/' && parsed.query.code) {
    const code = parsed.query.code;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('Received tokens!');
      console.log('Refresh token present?', !!tokens.refresh_token);

      if (tokens.refresh_token) {
        oauth.refresh_token = tokens.refresh_token;
        oauth.updatedAt = new Date().toISOString();
        fs.writeFileSync('./oauth_credentials.json', JSON.stringify(oauth, null, 2));

        // Update MongoDB app_settings
        const { client, db } = await connectToDatabase();
        try {
          await db.collection('app_settings').updateOne(
            { key: 'gdrive_credentials' },
            {
              $set: {
                key: 'gdrive_credentials',
                type: 'authorized_user',
                client_id: oauth.client_id,
                client_secret: oauth.client_secret,
                refresh_token: tokens.refresh_token,
                folder_id: oauth.folder_id || '1AklCKVKv7nWzACfeJrswJDR3jBj1EGpq',
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
          console.log('Successfully updated gdrive_credentials in MongoDB app_settings!');
        } finally {
          await client.close();
        }
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div style="font-family:sans-serif;text-align:center;padding:50px;">
          <h1 style="color:#10b981;">Google Drive Connected Successfully!</h1>
          <p>The refresh token has been saved to WorkSphere and MongoDB Atlas.</p>
          <p>You can close this tab now.</p>
        </div>
      `);
      console.log('OAuth authorization complete! Server shutting down in 3s...');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 3000);
    } catch (err) {
      console.error('Error exchanging token:', err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Error exchanging token</h1><pre>${err.message}</pre>`);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(54321, '127.0.0.1', () => {
  console.log('OAuth receiver listening on http://127.0.0.1:54321');
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive']
  });
  console.log('AUTH_URL:' + authUrl);
});
