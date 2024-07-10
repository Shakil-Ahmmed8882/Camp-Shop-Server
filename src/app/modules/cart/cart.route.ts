import express from 'express';
// import auth from '../../middlewares/auth';
// import { USER_ROLE } from '../User/user.constant';
// import validateRequest from '../../middlewares/validateRequest';
import validateRequest from '../../middlewares/validateRequest';
import { CartValidation } from './cart.validation';
import { CartControllers } from './cart.controller';

const router = express.Router();

router.post(
  '/add-to-cart',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(CartValidation.TUserCartValidation),
  CartControllers.handleAddToCart,
);

router.patch(
  '/',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CartControllers.handleUpdateCart,
);

router.delete(
  '/:id',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CartControllers.handleDeleteCart,
);
router.get(
  '/',
  //   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CartControllers.handleGetAllCarts,
);

export const CartRoutes = router;
