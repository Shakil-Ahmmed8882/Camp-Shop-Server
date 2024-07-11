/* eslint-disable @typescript-eslint/no-explicit-any */

import QueryBuilder from '../../builder/QueryBuilder';
import { TUserCart } from './cart.interface';
import { CartModel } from './cart.model';
import { isValidObjectId } from '../../utils/isValidObjectId';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { ProductModel } from '../product/product.model';
import { User } from '../User/user.model';
import mongoose, { Types } from 'mongoose';

const addToCart = async (
  payload: TUserCart,
  productId: string,
  quantity: number,
) => {
  // start a session for rollback
  const session = await mongoose.startSession();
  try {
    let isOutOfStock = false;
    // start transaction rollback
    session.startTransaction();
    const { userId } = payload;

    // find & check is user exist
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'Oops! user is not found');
    }

    // find & check is product exist
    const product = await ProductModel.findById(productId).session(session);
    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // check if product is out of stock
    if (product.stock <= 0) {
      isOutOfStock = true;
      return { cart: null, isOutOfStock };
    }

    // check if order quantity exceeds the available products
    if (quantity > product.stock) {
      isOutOfStock = true;
      return { cart: null, isOutOfStock };
    }

    // find & check is user already have added cart
    const cart = await CartModel.findOne({ userId }).session(session);
    if (!cart) {
      // Create a new cart for the user if user didn't add yet
      const newCart = new CartModel({
        userId,
        items: [{ productId, quantity: quantity }],
      });

      await newCart.save({ session });

      // save & end the transaction
      await session.commitTransaction();
      session.endSession();
      return { newCart, isOutOfStock };
    }

    // find & check does user already have
    // the prodcut on his cart
    const existingCartItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingCartItem) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Opps! already added.');
    }

    // // if so check it's available & increment quantity
    // if (existingCartItem) {
    //   if (existingCartItem.quantity + quantity > product.stock) {
    //     isOutOfStock = true;
    //     return { cart, isOutOfStock };
    //   }

    //   if (existingCartItem.quantity < product.stock) {
    //     existingCartItem.quantity += quantity;
    //   } else {
    //     throw new AppError(
    //       httpStatus.BAD_REQUEST,
    //       'Cannot add more items, stock limit reached',
    //     );
    //   }
    // } else {
    // new product in list of existing cart products
    cart.items.push({ productId, quantity: quantity });
    // }

    // save & end the transaction
    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();

    return { cart, isOutOfStock };
  } catch (error) {
    // cancel processing & end session
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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

const updateCart = async (payload: TUserCart) => {
  const { productId, quantity, userId } = payload;

  const session = await mongoose.startSession();
  try {
    let isOutOfStock = false;
    session.startTransaction();

    // check if order quantity exceeds the available products
    if (quantity <= 0) {
      throw new AppError(httpStatus.NOT_FOUND, "Opps! quantity can't be 0");
    }

    // check is cart exist
    const cart = await CartModel.findOne({ userId }).session(session);
    if (!cart) {
      throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    // check is product exist
    const product = await ProductModel.findById(productId).session(session);
    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'Opps! Product not found');
    }

    const cartItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString(),
    );
    if (!cartItem) {
      throw new AppError(httpStatus.NOT_FOUND, 'Opps! Product not in cart');
    }

    // check if product is out of stock
    if (product.stock <= 0) {
      isOutOfStock = true;
      return { cart: null, isOutOfStock };
    }

    // check if order quantity exceeds the available products
    if (quantity > product.stock) {
      isOutOfStock = true;
      return { cart: null, isOutOfStock };
    }

    cartItem.quantity = quantity;

    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log(cart)

    return { cart, isOutOfStock };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteCart = async (id: string) => {
  // check is valid id
  isValidObjectId(id);

  // delete project (soft deletion)
  const deletedProduct = await CartModel.findByIdAndDelete(id);

  return deletedProduct;
};

const getCartById = async (id: string) => {
  // check is valid id
  isValidObjectId(id);
  // delete project (soft deletion)
  const cart = await CartModel.findOne({ userId: id });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Opps! not found');
  }
  // Extract and map product IDs to ObjectId instances
  const productIds = cart?.items.map(
    (item) => new Types.ObjectId(item.productId),
  );

  // Query the product collection using the mapped product IDs
  const products = await ProductModel.find({ _id: { $in: productIds } });


  // this functionality loop array of product 
  // & return each product toal price based on its price & quantity 
  const productsWithPricesAndQuantity = products.map((product, i) => {
    const totalPrice = product.price * cart.items[i].quantity;
    return {
      product: product.name, // Adjust this based on your product schema
      price: product.price,
      quantity: cart.items[i].quantity,
      totalPrice: totalPrice,
    };
  });

  const totalPrice = productsWithPricesAndQuantity.reduce(
    (acc, cur) => acc + cur.totalPrice,
    0,
  );


  return { products: productsWithPricesAndQuantity, totalPrice };
};

export const CartServices = {
  addToCart,
  getAllCarts,
  deleteCart,
  getCartById,
  updateCart,
};
