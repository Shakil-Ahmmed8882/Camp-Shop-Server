import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CartServices } from './cart.service';

const handleAddToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await CartServices.addToCart(req.body, productId, quantity);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is created succesfully',
    data: result,
  });
});

const handleGetAllCarts = catchAsync(async (req, res) => {
  const query = req.query;
  const clearFilters = req.query?.clearFilters == 'true';
  const result = await CartServices.getAllCarts(query, clearFilters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Products are retrieved succesfully',
    meta: result.meta,
    data: result.result,
  });
});

const handleDeleteCart = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CartServices.deleteCart(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is deleted succesfully',
    data: result,
  });
});

export const CartControllers = {
  handleAddToCart,
  handleGetAllCarts,
  handleDeleteCart,
};
