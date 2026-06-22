const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://sagar_03:jGpZtSg59Nq6B7PS@ac-kxcg7ut-shard-00-00.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-01.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-02.uo7zpee.mongodb.net:27017/test?ssl=true&replicaSet=atlas-tjqeny-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function inspectDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log("--- SHOP ---");
    console.log(JSON.stringify(await db.collection('shops').findOne({}), null, 2));

    console.log("--- PROVIDER ---");
    console.log(JSON.stringify(await db.collection('providers').findOne({}), null, 2));

    console.log("--- DELIVERY PARTNER ---");
    console.log(JSON.stringify(await db.collection('deliverypartners').findOne({}), null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
}

inspectDb();
