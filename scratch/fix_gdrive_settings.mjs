import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');

  await db.collection('app_settings').updateOne(
    { key: 'gdrive_credentials' },
    {
      $set: { type: 'service_account', updatedAt: new Date() },
      $unset: { refresh_token: '', client_id: '', client_secret: '' }
    }
  );

  const updated = await db.collection('app_settings').findOne({ key: 'gdrive_credentials' });
  console.log('Cleaned credentials keys:', Object.keys(updated));
  console.log('type:', updated.type, 'client_email:', updated.client_email);

  await client.close();
}

main().catch(console.error);
