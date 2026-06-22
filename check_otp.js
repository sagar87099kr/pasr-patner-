const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const order = await db.collection('orders').findOne({ deliveryOTP: { $exists: true } });
  if (order) {
    console.log("Order has deliveryOTP:", order.deliveryOTP);
  } else {
    console.log("No deliveryOTP found");
  }

  process.exit(0);
}
check();
