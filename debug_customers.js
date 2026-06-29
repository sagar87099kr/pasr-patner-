const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(10).toArray();
  
  for (const o of orders) {
    console.log(`\nOrder ID: ${o.orderId || o._id}`);
    console.log(`CustomerID in order: ${o.customerId} (Type: ${typeof o.customerId})`);
    
    let custDoc = null;
    try {
        custDoc = await db.collection('customers').findOne({ _id: new mongoose.Types.ObjectId(o.customerId) });
    } catch(e) {}
    
    if (!custDoc) {
        custDoc = await db.collection('customers').findOne({ _id: String(o.customerId) });
    }
    
    if (custDoc) {
        console.log(`Found Customer Doc!`);
        console.log(`Keys in customer doc: ${Object.keys(custDoc).join(', ')}`);
        console.log(`Name: ${custDoc.name}, Username: ${custDoc.username}, firstName: ${custDoc.firstName}`);
    } else {
        console.log(`Could not find customer doc in DB.`);
    }
  }

  process.exit(0);
}

run();
