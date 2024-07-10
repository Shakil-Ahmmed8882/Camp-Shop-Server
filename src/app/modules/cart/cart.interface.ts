import { Types } from 'mongoose';

export interface TUserCart {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
}
