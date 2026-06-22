const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Mark all current pending orders as CANCELLED so they don't show as "New Orders"
  await db.collection('orders').updateMany(
    { status: { $in: ['Pending', 'Processing', 'CREATED'] } },
    { $set: { status: 'CANCELLED', orderStatus: 'CANCELLED', updatedAt: new Date() } }
  );

  // 2. Mark all completed orders as SETTLED so they don't count towards "Payment to Receive"
  await db.collection('orders').updateMany(
    { status: { $in: ['Completed', 'Delivered', 'COMPLETED'] } },
    { $set: { settlementStatus: 'SETTLED' } }
  );

  console.log("Database updated! Old orders cancelled and settled.");
  process.exit(0);
}
run();
