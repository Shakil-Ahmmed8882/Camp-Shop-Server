import { z } from 'zod';

const TUserCartValidation = z.object({
  body: z.object({
    userId: z.string().nonempty(),
    productId: z.string(),
    quantity: z.number().int().positive(),
  }),
});

export const CartValidation = { TUserCartValidation };
