/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';

import { TProduct } from './product.interface';
import { ProductModel } from './product.model';
import { isValidObjectId } from '../../utils/isValidObjectId';
import { deleteImageFromCloudinaryByUrl, sendImageToCloudinary } from '../../utils/sendImagesToCloudinary';

const createProduct = async (payload: TProduct, file: any) => {
  try {
    const imageName = `${payload?.name}`;
    const path = file?.path;
    //send image to cloudinary
    const secure_url = await sendImageToCloudinary(imageName, path);
    if (secure_url) {
      payload.images = [secure_url];
      return await ProductModel.create(payload);
    }
  } catch (error) {
    console.log(error);
  }
};

const getAllProducts = async (
  query: Record<string, unknown>,
  clearFilters: boolean = false,
) => {
  const queryBuilder = new QueryBuilder(ProductModel.find({isDeleted:false}), query);

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

const getSingleProduct = async (id: string) => {
  const result = await ProductModel.findById(id);
  return result;
};

const updateProduct = async (id: string, payload: Partial<TProduct>) => {
  // check is valid id
  isValidObjectId(id);

  // check is this product found by id
  const isProductExist = await ProductModel.exists({ _id: id });
  if (!isProductExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Opps! this product is not found!!',
    );
  }

  const { images, ...remainingAdminData } = payload;

  // Create an update query object with the
  // remaining product data
  const updateQuery: Record<string, unknown> = {
    ...remainingAdminData,
  };

  // (non-primitive) If there are new images, use $addToSet
  // with $each to add them to the existing array
  if (images && images.length) {
    updateQuery['$addToSet'] = { images: { $each: images } };
  }

  const result = await ProductModel.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProduct = async (id: string) => {
  // check is valid id
  isValidObjectId(id);
  const product = await ProductModel.findById(id)
  const productImage = product?.images[0]

  console.log({productImage})
if(productImage){
  deleteImageFromCloudinaryByUrl(productImage)
}
  // delete project (soft deletion)
  const deletedProduct = await ProductModel.findByIdAndUpdate(id, {
    isDeleted: true,
  });

  return deletedProduct;
};

export const productServices = {
  createProduct,
  getSingleProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
