import { connectToDatabase } from '../api/db.js';

async function resetRevenueAndAppointments() {
  try {
    const { db } = await connectToDatabase();
    
    // Clear all dummy appointments
    const appResult = await db.collection('appointments').deleteMany({});
    console.log(`Deleted ${appResult.deletedCount} appointments from MongoDB.`);

    // Delete paid dummy invoices or reset invoices
    const invResult = await db.collection('invoices').deleteMany({});
    console.log(`Deleted ${invResult.deletedCount} invoices from MongoDB.`);

    // Verify
    const appsCount = await db.collection('appointments').countDocuments();
    const invsCount = await db.collection('invoices').countDocuments();
    console.log(`Current MongoDB Appointments Count: ${appsCount}`);
    console.log(`Current MongoDB Invoices Count: ${invsCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error resetting MongoDB data:', err);
    process.exit(1);
  }
}

resetRevenueAndAppointments();
