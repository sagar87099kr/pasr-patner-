const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const shop = await db.collection('shops').findOne({});
  console.log(`\n### Sample Shop Document`);
  console.log(JSON.stringify(shop, null, 2));

  process.exit(0);
}

run();
