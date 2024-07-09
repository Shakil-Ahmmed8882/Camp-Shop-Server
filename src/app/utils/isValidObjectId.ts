import { Types } from 'mongoose';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

/**
 * Checks if the given id is a valid MongoDB ObjectId.
 * @param id - The id to be checked.
 * @returns True if the id is a valid ObjectId, otherwise false.
 */
export const isValidObjectId = (id: string) => {
   if(!Types.ObjectId.isValid(id)){
    throw new AppError(httpStatus.BAD_REQUEST,'Opps! invalid Id')
   }
};
