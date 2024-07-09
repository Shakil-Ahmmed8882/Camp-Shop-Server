import { model, Schema } from 'mongoose';

const reviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: false },
  comment: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const CartModel = model('Cart', reviewSchema);
