const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const orders = await db.collection('orders').find().limit(5).toArray();
  for (const o of orders) {
      console.log('Order:', o._id, 'shopId:', o.shopId, 'shop:', o.shop, 'seller:', o.seller, 'items:', o.items?.map(i => i.shopId || i.shop));
  }
  
  process.exit(0);
}
check();
