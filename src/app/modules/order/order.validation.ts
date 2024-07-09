import { z } from 'zod';

// Zod validation schema for a single product in the order
const orderProductSchema = z.object({
  productId: z.string().nonempty('Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Zod validation schema for the order model
const orderSchema = z.object({
  body: z.object({
    userId: z.string().nonempty('User ID is required'),
    products: z.array(orderProductSchema).nonempty('Products are required'),
    totalAmount: z.number().positive('Total amount must be a positive number'),
    status: z.string().default('pending'),
  }),
});

// Validation schema for creating an order
const createValidationOrderSchema = orderSchema;

// Validation schema for updating an order
const updateValidationOrderSchema = orderSchema.partial();

export { createValidationOrderSchema, updateValidationOrderSchema };
