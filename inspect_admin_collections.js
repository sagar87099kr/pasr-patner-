const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log("All Collections:\n", collectionNames.join(', '));
  console.log("\n--- Sample Schemas ---");

  const targetCollections = ['orders', 'payouts', 'deliverypartners', 'shops', 'providers', 'bazaars', 'products', 'kisansabha', 'farmers', 'transactions', 'users'];
  
  for (const name of targetCollections) {
    if (collectionNames.includes(name)) {
      const sample = await db.collection(name).findOne({});
      console.log(`\n### Collection: ${name}`);
      console.log(JSON.stringify(sample, null, 2));
    }
  }

  process.exit(0);
}

run();
