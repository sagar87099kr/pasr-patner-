const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const adminUser = await db.collection('users').findOne({ mobileNumber: '8709956547' });
  console.log(`\n### Admin User`);
  console.log(JSON.stringify(adminUser, null, 2));

  // Also check if there's an admins collection
  const cols = await db.listCollections().toArray();
  const names = cols.map(c => c.name);
  if (names.includes('admins')) {
    const admin = await db.collection('admins').findOne({});
    console.log(`\n### Admins Collection Sample`);
    console.log(JSON.stringify(admin, null, 2));
  }

  process.exit(0);
}

run();
