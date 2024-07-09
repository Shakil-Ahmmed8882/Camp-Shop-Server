import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CustomerServices } from './customer.service';

const getSingleCustomer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CustomerServices.getSingleCustomerFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is retrieved succesfully',
    data: result,
  });
});

const getAllCustomers = catchAsync(async (req, res) => {
  const result = await CustomerServices.getAllCustomersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admins are retrieved succesfully',
    meta: result.meta,
    data: result.result,
  });
});

const updateCustomer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { admin } = req.body;
  const result = await CustomerServices.updateCustomerIntoDB(id, admin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is updated succesfully',
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CustomerServices.deleteCustomerFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is deleted succesfully',
    data: result,
  });
});

export const CustomerControllers = {
  getAllCustomers,
  getSingleCustomer,
  deleteCustomer,
  updateCustomer,
};
