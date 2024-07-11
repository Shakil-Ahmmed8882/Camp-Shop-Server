import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { productServices } from './product.service';

const handleCreateProduct = catchAsync(async (req, res) => {
  const product = req.body;
  const result = await productServices.createProduct(product);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is created succesfully',
    data: result,
  });
});

const handleGetSingleProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.getSingleProduct(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is retrieved succesfully',
    data: result,
  });
});

const handleGetAllProducts = catchAsync(async (req, res) => {
  const query = req.query;
  const clearFilters = req.query?.clearFilters == 'true';
  const result = await productServices.getAllProducts(query, clearFilters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Products are retrieved succesfully',
    meta: result.meta,
    data: result.result,
  });
});

const handleUpdateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.updateProduct(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is updated succesfully',
    data: result,
  });
});

const handleDeleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.deleteProduct(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is deleted succesfully',
    data: result,
  });
});

export const ProductControllers = {
  handleCreateProduct,
  handleGetAllProducts,
  handleGetSingleProduct,
  handleDeleteProduct,
  handleUpdateProduct,
};
