const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const adminCustomer = await db.collection('customers').findOne({ username: '8709956547' }); // customers often use username for mobile
  console.log(`\n### Admin Customer`);
  console.log(JSON.stringify(adminCustomer, null, 2));

  // If not found by string, try number
  if (!adminCustomer) {
    const adminCustomerNum = await db.collection('customers').findOne({ username: 8709956547 });
    console.log(`\n### Admin Customer (number)`);
    console.log(JSON.stringify(adminCustomerNum, null, 2));
  }

  process.exit(0);
}

run();
