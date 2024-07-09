import { z } from 'zod';
import { UserStatus } from './user.constant';

const userValidationSchema = z.object({
  body: z.object({
    name: z.object({
      firstName: z.string().min(1, 'First name is required'),
      middleName: z.string().min(1, 'Middle name is required').optional(),
      lastName: z.string().min(1, 'Last name is required'),
    }),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string({
        invalid_type_error: 'Password must be string',
      })
      .max(20, { message: 'Password can not be more than 20 characters' })
      .optional(),
  }),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});
export const UserValidation = {
  userValidationSchema,
  changeStatusValidationSchema,
};
