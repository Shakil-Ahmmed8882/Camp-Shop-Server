import { Document, Types } from 'mongoose';

interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface TUserCart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
}
