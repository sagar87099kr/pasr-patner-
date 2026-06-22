const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const order = await db.collection('orders').findOne({ "items.0": { $exists: true } });
  console.log('Order items sample:', JSON.stringify(order?.items?.[0], null, 2));
  
  process.exit(0);
}
check();
