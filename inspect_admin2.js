const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const sample1 = await db.collection('transactionhistories').findOne({});
  console.log(`\n### Collection: transactionhistories`);
  console.log(JSON.stringify(sample1, null, 2));

  const sample2 = await db.collection('keshansabhaposts').findOne({});
  console.log(`\n### Collection: keshansabhaposts`);
  console.log(JSON.stringify(sample2, null, 2));

  process.exit(0);
}

run();
