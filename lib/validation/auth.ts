import z from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'passwordMin')
  .regex(/\p{L}/u, 'passwordLetter')
  .regex(/[0-9]/, 'passwordDigit')
  .regex(/[^a-zA-Z0-9\s\p{L}]/u, 'passwordSpecial');

export const signInSchema = z.object({
  email: z.email('invalidEmail'),
  password: z.string().min(8, 'passwordMin'),
});

export const signUpSchema = z
  .object({
    email: z.email('invalidEmail'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordMatch',
    path: ['confirmPassword'],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
