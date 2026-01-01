import { z } from 'zod';

// Property Schema
export const PropertySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string().min(1, 'กรุณากรอกชื่อที่พัก'),
  slug: z.string().min(1, 'กรุณากรอก slug'),
  description: z.string().optional(),
  address: z.string().min(1, 'กรุณากรอกที่อยู่'),
  district: z.string().optional(),
  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'รหัสไปรษณีย์ไม่ถูกต้อง').optional(),
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรไม่ถูกต้อง').optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional(),
  lineId: z.string().optional(),
  totalRooms: z.number().int().min(1, 'ต้องมีอย่างน้อย 1 ห้อง').default(1),
  checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'เวลาไม่ถูกต้อง').default('14:00'),
  checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'เวลาไม่ถูกต้อง').default('12:00'),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Property = z.infer<typeof PropertySchema>;

// Create Property Input
export const CreatePropertySchema = PropertySchema.omit({
  id: true,
  ownerId: true,
  slug: true,
  totalRooms: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;

// Update Property Input
export const UpdatePropertySchema = PropertySchema.partial().omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;

// Property List Item (for listing)
export const PropertyListItemSchema = PropertySchema.pick({
  id: true,
  name: true,
  slug: true,
  province: true,
  totalRooms: true,
  isActive: true,
}).extend({
  availableRooms: z.number().int().default(0),
  occupancyRate: z.number().min(0).max(100).default(0),
});

export type PropertyListItem = z.infer<typeof PropertyListItemSchema>;
