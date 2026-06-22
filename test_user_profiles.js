const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Wait, I need actualUserId
  // In the API, the curl gave id "6a3738b1c3164d7693c865fc" for username 8252271535.
  const actualUserId = "6a3738b1c3164d7693c865fc";

  const customer = await db.collection('customers').findOne({ _id: new ObjectId(actualUserId) });
  console.log("Customer:", customer ? customer.username : "Not found");

  const profiles = [];

  const shops = await db.collection('shops').find({ owner: new ObjectId(actualUserId) }).toArray();
  console.log("Shops:", shops.length);

  const providers = await db.collection('providers').find({ owner: new ObjectId(actualUserId) }).toArray();
  console.log("Providers:", providers.length);

  if (customer && customer.username) {
    const deliveryPartners = await db.collection('deliverypartners').find({ phoneNumber: Number(customer.username) }).toArray();
    console.log("Delivery Partners matched by Number(username):", deliveryPartners.length);
    // Also try string matching
    const deliveryPartnersStr = await db.collection('deliverypartners').find({ phoneNumber: String(customer.username) }).toArray();
    console.log("Delivery Partners matched by String(username):", deliveryPartnersStr.length);
  }

  process.exit(0);
}
run();
