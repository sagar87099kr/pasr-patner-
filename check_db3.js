const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const anyItem = await db.collection('items').findOne({ _id: new mongoose.Types.ObjectId("698c84c7bd60020ce45493f3") });
  console.log('Item content:', JSON.stringify(anyItem, null, 2));
  
  process.exit(0);
}
check();
