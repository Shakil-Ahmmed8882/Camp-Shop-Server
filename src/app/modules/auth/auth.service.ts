import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TLoginUser } from './auth.interface';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { User } from '../User/user.model';

const loginUser = async (payload: TLoginUser) => {
  const { id } = payload;

  const user = await User?.isUserExistsByCustomId(id);

  // checking if the user exist in the database
  if (!user) {
    throw new AppError(404, 'Oppps! This user is not found in the database.');
  }

  // checking is the user is already deleted
  if (user.isDeleted === true) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Oppps!! This user is already is deleted ',
    );
  }

  // checking is the user is blocked
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'Oppps!! This user is blocked');
  }

  // checking is the password correct
  if (!(await User?.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Oppps!! This password is not matched. Try again. ',
    );
  }

  // create access token using JWT

  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const accessToken = jwt.sign(
    jwtPayload,
    config?.jwt_access_secret as string,
    { expiresIn: '10d' },
  );

  return {
    accessToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};



export const AuthServices = {
  loginUser,
};
