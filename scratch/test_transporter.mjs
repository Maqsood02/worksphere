import { connectToDatabase } from '../api/db.js';
import { getMailTransporter } from '../api/index.js';

async function test() {
  const { db } = await connectToDatabase();
  const tWithDb = await getMailTransporter(db);
  console.log('Transporter with db created');
  
  // Now test without db (like sendTaskNotification did)
  const tWithoutDb = await getMailTransporter(null);
  console.log('Transporter without db created');
}

test().catch(console.error);
