const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const idToFind = new mongoose.Types.ObjectId("69e6ca3bea774a0333d5f373");
  
  // check users collection
  const inUsers = await db.collection('users').findOne({ _id: idToFind });
  console.log('In users:', inUsers ? true : false);
  
  // check customers collection again just in case
  const inCusts = await db.collection('customers').findOne({ _id: idToFind });
  console.log('In customers:', inCusts ? true : false);

  process.exit(0);
}

run();
