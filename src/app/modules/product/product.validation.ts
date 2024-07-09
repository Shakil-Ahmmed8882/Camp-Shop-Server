import { z } from 'zod';

// Zod validation schema for the product model
const productSchema = z.object({
  body: z.object({
    name: z.string().nonempty('Name is required'),
    description: z.string().nonempty('Description is required'),
    price: z.number().positive('Price must be a positive number'),
    category: z.string().nonempty('Category is required'),
    stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
    images: z.array(z.string().url()).optional(),
  }),
});

// Validation schema for creating a product
const createValidationProductSchema = productSchema;

// Validation schema for updating a product
const updateValidationProductSchema = z.object({
    body: z.object({
      name: z.string().nonempty('Name is required').optional(),
      description: z.string().nonempty('Description is required').optional(),
      price: z.number().positive('Price must be a positive number').optional(),
      category: z.string().nonempty('Category is required').optional(),
      stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
      images: z.array(z.string().url()).optional()
    }),
  });

export { createValidationProductSchema, updateValidationProductSchema };
