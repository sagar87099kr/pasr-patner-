const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const userByStr = await db.collection('users').findOne({ _id: '69732e784466daabf8bf925e' });
  console.log('User found by String ID:', !!userByStr);

  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);
  console.log('Collections:', names.filter(n => n.includes('user') || n.includes('customer')));

  if (names.includes('customers')) {
      const customer = await db.collection('customers').findOne({ _id: new mongoose.Types.ObjectId('69732e784466daabf8bf925e') });
      console.log('Found in customers by ObjectId:', !!customer);
  }

  process.exit(0);
}
check();
