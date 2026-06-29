const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://sagar_03:jGpZtSg59Nq6B7PS@ac-kxcg7ut-shard-00-00.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-01.uo7zpee.mongodb.net:27017,ac-kxcg7ut-shard-00-02.uo7zpee.mongodb.net:27017/test?ssl=true&replicaSet=atlas-tjqeny-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0');
  
  const Order = mongoose.model('Order', new mongoose.Schema({
    orderId: String,
    shopId: mongoose.Schema.Types.ObjectId
  }, { strict: false }));

  const order = await Order.findOne({ orderId: 'PASR-ORD-1782312261425-100' });
  console.log("Order found:", order);
  
  if (order) {
    console.log("Order shopId:", order.shopId.toString());
  }
  
  process.exit(0);
}
check();
