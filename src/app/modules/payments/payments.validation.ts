import { z } from 'zod';

// Zod validation schema for the payment model
const paymentSchema = z.object({
  body: z.object({
    userId: z.string().nonempty('User ID is required'), // Assuming ObjectId is stored as a string
    orderId: z.string().nonempty('Order ID is required'), // Assuming ObjectId is stored as a string
    amount: z.number().positive('Amount must be a positive number'),
    method: z.string().nonempty('Payment method is required'),
    status: z.string().nonempty('Payment status is required'),
  }),
});

// Validation schema for creating a payment
const createValidationPaymentSchema = paymentSchema;

// Validation schema for updating a payment
const updateValidationPaymentSchema = paymentSchema.partial();

export { createValidationPaymentSchema, updateValidationPaymentSchema };
