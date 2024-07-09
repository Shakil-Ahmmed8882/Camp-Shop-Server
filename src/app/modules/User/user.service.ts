/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';

import { TUser } from './user.interface';
import { User } from './user.model';
import { generateUserId } from './user.utils';
import { AdminModel } from '../admin/admin.model';
import { TAdminProfile } from '../admin/admin.interface';
import { CustomerModel } from '../customer/customer.model';
import { sendImageToCloudinary } from '../../utils/sendImagesToCloudinary';
import { TCustomerProfile } from '../customer/customer.interface';

const createAdmin = async (
  file: any,
  password: string,
  payload: TAdminProfile,
) => {
  const { email, name } = payload;

  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string);

  //set user role
  userData.role = 'admin';
  //set user email
  userData.email = email;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    userData.id = await generateUserId();

    // user name
    userData.name = {
      firstName: name.firstName,
      middleName: name.middleName,
      lastName: name.lastName,
    };

    const imageName = `${userData.id}${payload?.name?.firstName}`;
    const path = file?.path;
    //send image to cloudinary
    const secure_url = await sendImageToCloudinary(imageName, path);
    userData.profileImg = secure_url;

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });

    //create a admin
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id
    payload.profileImg = secure_url;
    // create a admin (transaction-2)

    const newAdmin = await AdminModel.create([payload], { session });

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};
const createUser = async (file: any, password: string, payload: TUser) => {
  const { email } = payload;

  // check is user already exist
  const user = await User.findOne({ email });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Opps! User already exist');
  }


  //if password is not given , use deafult password
  payload.password = password || (config.default_password as string);

  //set user role
  payload.role = 'user';

  //set  generated id
  payload.id = await generateUserId();

  const imageName = `${payload.id}${payload?.name?.firstName}`;
  const path = file?.path;
  //send image to cloudinary
  const secure_url = await sendImageToCloudinary(imageName, path);
  payload!.profileImg = secure_url;

  // create a user (transaction-1)
  console.log({userData: payload});
  const newUser = await User.create(payload);
  console.log({ newUser });

  return newUser;
};

const createCustomer = async (
  file: any,
  password: string,
  payload: TCustomerProfile,
) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string);

  //set student role
  userData.role = 'customer';
  // set student email
  userData.email = payload.email;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    //upload image to cloudinary
    const imageName = `${userData.id}${payload?.name?.firstName}`;
    const path = file?.path;
    const secure_url = await sendImageToCloudinary(imageName, path);

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session }); // array

    //create a student
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    // set id , _id as user
    payload.user = newUser[0]._id; //reference _id
    payload.profileImg = secure_url;

    // create a student (transaction-2)

    const newStudent = await CustomerModel.create([payload], { session });

    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student');
    }

    await session.commitTransaction();
    await session.endSession();

    return newStudent;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const getMe = async (userId: string, role: string) => {
  let result = null;
  if (role === 'user') {
    result = await User.findOne({ id: userId }).populate('user');
  }
  if (role === 'admin') {
    result = await AdminModel.findOne({ id: userId }).populate('user');
  }

  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const UserServices = {
  createCustomer,
  createUser,
  createAdminIntoDB: createAdmin,
  getMe,
  changeStatus,
};
