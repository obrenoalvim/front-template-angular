// src/app/core/validators/schemas/auth.schemas.ts
import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'validation.required')
  .email('validation.invalidEmail');
export const passwordSchema = z.string().min(8, 'validation.passwordTooShort');
export const nameSchema = z.string().min(2, 'validation.nameTooShort');

export const loginFieldSchemas = { email: emailSchema, password: passwordSchema };

export const registerFieldSchemas = {
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
};

export const forgotPasswordFieldSchemas = { email: emailSchema };

export const updateProfileFieldSchemas = { name: nameSchema };

export const changePasswordGroupSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'validation.passwordsDontMatch',
    path: ['confirmPassword'],
  });

export const resetPasswordGroupSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsDontMatch',
    path: ['confirmPassword'],
  });
