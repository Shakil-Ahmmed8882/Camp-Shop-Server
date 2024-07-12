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

      // decrease the qantity
      await ProductModel.findByIdAndUpdate(productId, {
        stock: product.stock - quantity,
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
  const { productId, isIncrease, userId } = payload;

  try {
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    if (product.stock <= 0 && isIncrease) {
      return { cart: null, isOutOfStock: true };
    }

    const cartItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString(),
    );
    if (!cartItem) {
      throw new AppError(httpStatus.NOT_FOUND, 'Product not in cart');
    }

    // increase or decrease stock based on (-) (+);
    const stockQuantity = isIncrease ? product.stock - 1 : product.stock + 1;
    await ProductModel.findByIdAndUpdate(productId, {
      stock: stockQuantity,
    });

    // cart quantity reverse way (minus product stock once add)
    ///( plus product stock once remove from the cart  )
    cartItem.quantity = isIncrease
      ? cartItem.quantity + 1
      : cartItem.quantity - 1;

    await cart.save();

    return { cart, isOutOfStock: false };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteCart = async (cartId: string, productId: string) => {
  // check is valid id
  isValidObjectId(cartId);
  isValidObjectId(productId);

  const deletedProduct = await CartModel.findByIdAndUpdate(
    cartId,
    { $pull: { items: { productId: productId } } },
    { new: true },
  );

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
      productId: product?._id,
      cartId: cart?._id,
      stock: product?.stock,
      quantity: cart.items[i].quantity,
      totalPrice: totalPrice,
    };
  });

  const totalPrice = productsWithPricesAndQuantity.reduce(
    (acc, cur) => acc + cur.totalPrice,
    0,
  );

  return {
    products: productsWithPricesAndQuantity,
    totalPrice: totalPrice.toFixed(2),
  };
};

export const CartServices = {
  addToCart,
  getAllCarts,
  deleteCart,
  getCartById,
  updateCart,
};
