import mongoose from '../mongoose';

const orderSchema = new mongoose.Schema({
  totalPrice: { type: Number, required: true },
  date: { type: Date, default: new Date() },
  id_main_db: { type: Number, required: true },
  status: { type: String, required: false },
  client_id: { type: Number, required: true },
  client_name: { type: String, required: true },
  pick_up_date: { type: Date, required: true },
  pick_up: { type: Number, required: true },
  arrival_time: { type: Number, required: false },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      cant: { type: Number, required: true },
    },
  ]
});

const Order = mongoose.model('Order', orderSchema);
export default Order;