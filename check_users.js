const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://sagar_03:jGpZtSg59Nq6B7PS@cluster0.uo7zpee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId('69732e784466daabf8bf925e') });
  console.log('User found by ObjectId:', !!user);
  if (user) console.log(user);

  const anyUser = await db.collection('users').findOne({});
  console.log('Any user keys:', Object.keys(anyUser));
  if (anyUser) console.log('Any user name field:', anyUser.name, anyUser.fullName, anyUser.firstName);
  
  process.exit(0);
}
check();
