import mongoose from '../mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  ingredients: { type: String, default: "" },
  listPrice: { type: Number, required: true },
  id_main_db: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
