import { z } from 'zod';

// Base User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  displayName: z.string().min(1, 'กรุณากรอกชื่อ'),
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรไม่ถูกต้อง').optional(),
  photoURL: z.string().url().optional(),
  role: z.enum(['owner', 'staff', 'admin']).default('owner'),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

// Create User Input (for registration)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Update User Input
export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Login Input
export const LoginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Register Input
export const RegisterSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, 'กรุณากรอกชื่อ'),
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรไม่ถูกต้อง').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
