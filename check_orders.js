const mongoose = require('mongoose');
const Order = require('../pasr/backend/data/order');
mongoose.connect('mongodb+srv://developerPaSr:paSr_Developer74@pasr.r90otb8.mongodb.net/test?retryWrites=true&w=majority')
  .then(async () => {
    const orders = await Order.find({ shopId: { $exists: true } }).sort({ createdAt: -1 }).limit(20);
    console.log(orders.map(o => ({
      id: o._id,
      shopId: o.shopId,
      status: o.orderStatus,
      settlementStatus: o.settlementStatus,
      total: o.totalAmount,
      subtotal: o.subtotalAmount,
      paymentType: o.paymentType
    })));
    mongoose.disconnect();
  });
