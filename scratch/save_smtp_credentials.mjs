import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.SPRING_DATA_MONGODB_URI || "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

export async function saveSmtpPassword(appPassword, userEmail = 'worksphere.ac.in@gmail.com') {
  const cleanPass = appPassword.trim().replace(/\s+/g, '');
  const cleanUser = userEmail.trim();

  console.log(`[TESTING] Testing credentials with Google SMTP for ${cleanUser}...`);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: cleanUser,
      pass: cleanPass
    }
  });

  try {
    await transporter.verify();
    console.log(`[SUCCESS] ✓ Google SMTP authenticated successfully for ${cleanUser}!`);
  } catch (err) {
    console.error(`[ERROR] Google rejected the credentials: ${err.message}`);
    throw err;
  }

  // Save to MongoDB Atlas app_settings
  console.log(`[SAVING] Saving to MongoDB Atlas app_settings collection...`);
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const settingsCol = db.collection('app_settings');
    await settingsCol.updateOne(
      { key: 'smtp_credentials' },
      { $set: { key: 'smtp_credentials', user: cleanUser, password: cleanPass, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`[SAVED] ✓ smtp_credentials successfully saved to MongoDB Atlas!`);
  } finally {
    await client.close();
  }

  // Update backend application.properties
  const appPropertiesPath = path.resolve(__dirname, '../backend/src/main/resources/application.properties');
  if (fs.existsSync(appPropertiesPath)) {
    let content = fs.readFileSync(appPropertiesPath, 'utf8');
    content = content.replace(
      /spring\.mail\.password=\$\{SPRING_MAIL_PASSWORD:[^}]*\}/,
      `spring.mail.password=\${SPRING_MAIL_PASSWORD:${cleanPass}}`
    );
    fs.writeFileSync(appPropertiesPath, content, 'utf8');
    console.log(`[SAVED] ✓ application.properties updated with new password!`);
  }

  return true;
}

const inputPass = process.argv[2];
if (inputPass) {
  saveSmtpPassword(inputPass)
    .then(() => {
      console.log('ALL DONE! Credentials are now live across DB, Backend, and Cloud!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed:', err.message);
      process.exit(1);
    });
} else {
  console.log('Usage: node scratch/save_smtp_credentials.mjs "<16-character-app-password>"');
}
