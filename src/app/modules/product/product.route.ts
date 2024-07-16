import express from 'express';
// import auth from '../../middlewares/auth';
// import { USER_ROLE } from '../User/user.constant';
// import validateRequest from '../../middlewares/validateRequest';
import validateRequest from '../../middlewares/validateRequest';
import {
  
  updateValidationProductSchema,
} from './product.validation';
import { ProductControllers } from './product.controller';


const router = express.Router();

router.post(
  '/create-product',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  // upload.single('image'),
  // parseBody,
  // validateRequest(createValidationProductSchema),
  ProductControllers.handleCreateProduct,
);

router.get(
  '/:id',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  ProductControllers.handleGetSingleProduct,
);

router.post(
  '/:id',
  //   auth(USER_ROLE.superAdmin),
  // upload.single('image'),
  // parseBody,
  validateRequest(updateValidationProductSchema),
  ProductControllers.handleUpdateProduct,
);

router.delete(
  '/:id',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  ProductControllers.handleDeleteProduct,
);
router.get(
  '/',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  ProductControllers.handleGetAllProducts,
);

export const ProductRoutes = router;
