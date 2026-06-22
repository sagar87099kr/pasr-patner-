const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const customer = await db.collection('customers').findOne({ _id: new mongoose.Types.ObjectId('69732e784466daabf8bf925e') });
  console.log(customer);
  
  process.exit(0);
}
check();
