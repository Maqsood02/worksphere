import fs from 'fs';
import { google } from 'googleapis';

const oauth = JSON.parse(fs.readFileSync('./oauth_credentials.json', 'utf8'));
const oauth2Client = new google.auth.OAuth2(oauth.client_id, oauth.client_secret, 'http://127.0.0.1:54321');

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive']
});

console.log('=== Google Drive Auth URL ===');
console.log(authUrl);
