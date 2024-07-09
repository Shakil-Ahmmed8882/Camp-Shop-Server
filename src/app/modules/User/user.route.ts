/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';
import { createAdminValidationSchema } from '../admin/admin.validation';
// import { DeserialzeData } from '../../utils/DeserializeData';

const router = express.Router();



router.post(
  '/create-admin',
  // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  // bring JSON back into object
  // DeserialzeData,
  validateRequest(createAdminValidationSchema),
  UserControllers.createAdmin,
);

router.post(
  '/create-customer',
  // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  // bring JSON back into object
  // DeserialzeData,
  validateRequest(createAdminValidationSchema),
  UserControllers.createCustomer,
);

router.post(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.get(
  '/me',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.admin,
  ),
  UserControllers.getMe,
);

export const UserRoutes = router;
