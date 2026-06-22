const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const shop = await db.collection('shops').findOne({ owner: '66336ffb18db3d85bc21f84d' });
  console.log("Shop Info:", shop.category, shop.type);

  // Check categories collection if exists
  const collections = await db.listCollections().toArray();
  const catColl = collections.find(c => c.name === 'categories' || c.name === 'category');
  if (catColl) {
    const cats = await db.collection(catColl.name).find({}).toArray();
    console.log("Global categories:", cats);
  }

  process.exit(0);
}
run();
