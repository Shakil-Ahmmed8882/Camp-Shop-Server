/* eslint-disable @typescript-eslint/no-explicit-any */

import QueryBuilder from '../../builder/QueryBuilder';
import { TUserCart } from './cart.interface';
import { CartModel } from './cart.model';
import { isValidObjectId } from '../../utils/isValidObjectId';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { ProductModel } from '../product/product.model';

const addToCart = async (payload: TUserCart, productId: string) => {
  const { userId } = payload;

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (product.stock <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product is out of stock');
  }

  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    // Create a new cart for the user if it doesn't exist
    const newCart = new CartModel({
      userId,
      items: [{ productId, quantity: 1 }],
    });
    await newCart.save();
    return newCart;
  }

  const existingCartItem = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (existingCartItem) {
    if (existingCartItem.quantity < product.stock) {
      existingCartItem.quantity += 1;
    } else {
      throw new Error('Cannot add more items, stock limit reached');
    }
  } else {
    cart.items.push({ productId, quantity: 1 });
  }

  await cart.save();
  return cart;
};

const getAllCarts = async (
  query: Record<string, unknown>,
  clearFilters: boolean = false,
) => {
  const queryBuilder = new QueryBuilder(CartModel.find(), query);

  if (clearFilters) {
    queryBuilder.clearFilters();
  } else {
    queryBuilder.search(['name']).filter().sort().paginate().fields();
  }

  const result = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return {
    result,
    meta,
  };
};

const deleteCart = async (id: string) => {
  // check is valid id
  isValidObjectId(id);
  // delete project (soft deletion)
  const deletedProduct = await CartModel.findByIdAndUpdate(id, {
    isDeleted: true,
  });

  return deletedProduct;
};

export const CartServices = {
  addToCart,
  getAllCarts,
  deleteCart,
};
