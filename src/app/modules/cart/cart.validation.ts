import { z } from 'zod';

// Zod validation schema for the review model
const reviewSchema = z.object({
  body: z.object({
    userId: z.string().nonempty('User ID is required'), // Assuming ObjectId is stored as a string
    productId: z.string().nonempty('Product ID is required'), // Assuming ObjectId is stored as a string
    rating: z
      .number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
    comment: z.string().optional(),
  }),
});

// Validation schema for creating a review
const createValidationReviewSchema = reviewSchema;

// Validation schema for updating a review
const updateValidationReviewSchema = reviewSchema.partial();

export { createValidationReviewSchema, updateValidationReviewSchema };
