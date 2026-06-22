const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');
  
  const db = mongoose.connection.db;
  if (!db) return;

  const shop = await db.collection('shops').findOne({ shopName: 'Verma hotel doranda' });
  console.log('Shop ID:', shop?._id);
  console.log('Shop Owner:', shop?.owner);

  if (shop) {
    const ownerId = shop.owner;
    console.log('Finding products for ownerId:', ownerId);
    
    const master = await db.collection('masterproducts').find({ owner: ownerId }).toArray();
    console.log('masterproducts by owner:', master.length);
    
    const products = await db.collection('products').find({ owner: ownerId }).toArray();
    console.log('products by owner:', products.length);

    const master2 = await db.collection('masterproducts').find({ shopId: String(shop._id) }).toArray();
    console.log('masterproducts by shopId:', master2.length);
    
    const products2 = await db.collection('products').find({ shopId: String(shop._id) }).toArray();
    console.log('products by shopId:', products2.length);

    const products3 = await db.collection('products').find({ "shopId": shop._id }).toArray();
    console.log('products by shopId (ObjectId):', products3.length);

    // Let's also check the actual item ID we curled
    const item = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId("698c84c7bd60020ce45493f3") });
    if (item) {
        console.log('Found product directly by ID! Keys:', Object.keys(item));
        console.log('Product owner:', item.owner, 'shopId:', item.shopId);
    } else {
        const mItem = await db.collection('masterproducts').findOne({ _id: new mongoose.Types.ObjectId("698c84c7bd60020ce45493f3") });
        if (mItem) {
             console.log('Found masterproduct directly! Keys:', Object.keys(mItem));
             console.log('Product owner:', mItem.owner, 'shopId:', mItem.shopId);
        } else {
             const anyItem = await db.collection('items').findOne({ _id: new mongoose.Types.ObjectId("698c84c7bd60020ce45493f3") });
             if (anyItem) {
                 console.log('Found in items collection! Keys:', Object.keys(anyItem));
             } else {
                 console.log('Product not found in products, masterproducts, or items!');
             }
        }
    }
  }
  
  process.exit(0);
}

check();
