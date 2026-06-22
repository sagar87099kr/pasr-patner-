const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://sagar_03:jGpZtSg59Nq6B7PS@ac-kxcg7ut-shard-00-00.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-01.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-02.uo7zpee.mongodb.net:27017/test?ssl=true&replicaSet=atlas-2y42m5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function checkProducts() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const shop = await db.collection('shops').findOne({ shopName: 'Digamber Store' });
  console.log('Shop Items Array:', shop.items);

  const itemsQuery = shop.items.map(id => typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);
  console.log('Items Query:', itemsQuery);

  const masterProducts = await db.collection('masterproducts').find({ _id: { $in: itemsQuery } }).toArray();
  console.log('MasterProducts Found:', masterProducts.length);

  const products = await db.collection('products').find({ _id: { $in: itemsQuery } }).toArray();
  console.log('Products Found:', products.length);

  const directMaster = await db.collection('masterproducts').find({}).limit(1).toArray();
  console.log('Sample Master Product:', directMaster[0]?._id, directMaster[0]?.shopId);

  const directProd = await db.collection('products').find({}).limit(1).toArray();
  console.log('Sample Product:', directProd[0]?._id, directProd[0]?.owner);

  process.exit(0);
}

checkProducts();
