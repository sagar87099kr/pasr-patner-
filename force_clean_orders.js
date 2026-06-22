const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Mark ALL orders that are not Completed/Delivered/Cancelled as CANCELLED
  await db.collection('orders').updateMany(
    { 
      $and: [
        { status: { $nin: ['Completed', 'COMPLETED', 'Delivered', 'Cancelled', 'CANCELLED'] } },
        { orderStatus: { $nin: ['Completed', 'COMPLETED', 'Delivered', 'Cancelled', 'CANCELLED'] } }
      ]
    },
    { $set: { status: 'CANCELLED', orderStatus: 'CANCELLED', updatedAt: new Date() } }
  );
  
  // Also catch any order that literally has no status field at all
  await db.collection('orders').updateMany(
    { status: { $exists: false }, orderStatus: { $exists: false } },
    { $set: { status: 'CANCELLED', orderStatus: 'CANCELLED', updatedAt: new Date() } }
  );

  console.log("Database updated! ALL non-completed orders forcefully cancelled.");
  process.exit(0);
}
run();
