const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://sagar_03:jGpZtSg59Nq6B7PS@ac-kxcg7ut-shard-00-00.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-01.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-02.uo7zpee.mongodb.net:27017/test?ssl=true&replicaSet=atlas-2y42m5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const shop = await db.collection('shops').findOne({ shopName: 'Digamber Store' });
  console.log('Shop ID:', shop._id);
  console.log('Shop Owner:', shop.owner);
  
  // check masterproducts by owner
  const p1 = await db.collection('masterproducts').find({ owner: String(shop.owner) }).toArray();
  console.log('Masterproducts with owner as string:', p1.length);
  
  const p2 = await db.collection('masterproducts').find({ owner: shop.owner }).toArray();
  console.log('Masterproducts with owner as ObjectId:', p2.length);

  const p3 = await db.collection('products').find({ owner: String(shop.owner) }).toArray();
  console.log('Products with owner as string:', p3.length);

  const p4 = await db.collection('products').find({ owner: shop.owner }).toArray();
  console.log('Products with owner as ObjectId:', p4.length);

  const p5 = await db.collection('products').find({ shopId: String(shop._id) }).toArray();
  console.log('Products with shopId as string:', p5.length);

  const sample = await db.collection('masterproducts').find({}).limit(1).toArray();
  console.log('Sample masterproduct keys:', sample.length ? Object.keys(sample[0]) : 'None');

  process.exit(0);
}
check();
