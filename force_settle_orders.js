const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Force mark EVERY SINGLE ORDER currently in the database as SETTLED
  await db.collection('orders').updateMany(
    {},
    { $set: { settlementStatus: 'SETTLED' } }
  );

  console.log("Database updated! All existing orders have been forcefully SETTLED.");
  process.exit(0);
}
run();
