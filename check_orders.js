const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name).filter(n => n.toLowerCase().includes('order')));
  
  const sampleOrder = await db.collection('orders').findOne({});
  if (sampleOrder) {
      console.log('Sample Order Keys:', Object.keys(sampleOrder));
      console.log('Sample Order shop/owner references:', {
          shopId: sampleOrder.shopId,
          seller: sampleOrder.seller,
          shop: sampleOrder.shop,
          items: sampleOrder.items ? sampleOrder.items.length : 0,
          status: sampleOrder.status
      });
  } else {
      console.log('No orders found in "orders" collection');
  }
  
  process.exit(0);
}
check();
