import { z } from 'zod';

const TUserCartValidation = z.object({
  body: z.object({
    userId: z.string().nonempty(),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    ),
  }),
});

export const CartValidation = { TUserCartValidation };
