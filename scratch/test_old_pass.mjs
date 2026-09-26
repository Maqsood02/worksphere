import { connectToDatabase } from '../api/db.js';

async function testOldPassword() {
  const nodemailer = (await import('nodemailer')).default;
  const t = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: 'worksphere.ac.in@gmail.com', pass: 'mbtfgehiiejzwtzk' }
  });
  try {
    await t.verify();
    console.log('Old password verified: SUCCESS');
  } catch (e) {
    console.log('Old password verified: FAILED ->', e.message);
  }
}

testOldPassword().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
