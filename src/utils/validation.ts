import { z } from 'zod';

export const emailSchema = z.string().email('Please enter a valid email address.');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters.');
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.');

export const ageSchema = z.number().min(5, 'Age must be at least 5.').max(120, 'Age cannot exceed 120.');
export const heightSchema = z.number().min(50, 'Height must be at least 50 cm.').max(300, 'Height cannot exceed 300 cm.');
export const weightSchema = z.number().min(20, 'Weight must be at least 20 kg.').max(500, 'Weight cannot exceed 500 kg.');

// Helper validator for forms
export const userRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const profileBiometricsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().max(160, 'Bio must be under 160 characters.').optional(),
  location: z.string().optional(),
  fitnessGoal: z.string().optional(),
  age: z.preprocess((val) => (val === '' ? undefined : Number(val)), ageSchema.optional()),
  gender: z.string().optional(),
  height: z.preprocess((val) => (val === '' ? undefined : Number(val)), heightSchema.optional()),
  weight: z.preprocess((val) => (val === '' ? undefined : Number(val)), weightSchema.optional())
});
