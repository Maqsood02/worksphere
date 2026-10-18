import { connectToDatabase } from '../api/db.js';
import { getCredentials, verifyGoogleDriveCredentials } from '../api/gdrive.js';

async function testGDrive() {
  const { client, db } = await connectToDatabase();
  try {
    const creds = await getCredentials(db);
    console.log('Creds found:', creds ? { type: creds.type, email: creds.client_email, folder_id: creds.folder_id } : null);
    if (creds) {
      const verify = await verifyGoogleDriveCredentials(creds);
      console.log('Verification result:', verify);
    }

    const appSetting = await db.collection('app_settings').findOne({ key: 'gdrive_credentials' });
    console.log('app_settings gdrive_credentials:', appSetting ? { type: appSetting.type, email: appSetting.client_email, hasKey: Boolean(appSetting.private_key) } : null);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.close();
  }
}

testGDrive();
