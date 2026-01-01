import { z } from 'zod';
import { ROOM_STATUS, ROOM_TYPE } from '../constants';

// Room Status Enum
export const RoomStatusSchema = z.enum([
  ROOM_STATUS.AVAILABLE,
  ROOM_STATUS.OCCUPIED,
  ROOM_STATUS.CLEANING,
  ROOM_STATUS.MAINTENANCE,
]);

// Room Type Enum
export const RoomTypeSchema = z.enum([
  ROOM_TYPE.STANDARD,
  ROOM_TYPE.DELUXE,
  ROOM_TYPE.DORMITORY,
  ROOM_TYPE.SUITE,
]);

// Room Schema
export const RoomSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().min(1, 'กรุณากรอกชื่อห้อง'),
  roomNumber: z.string().min(1, 'กรุณากรอกหมายเลขห้อง'),
  type: RoomTypeSchema.default('standard'),
  description: z.string().optional(),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  capacity: z.number().int().min(1, 'ต้องรองรับอย่างน้อย 1 คน').default(2),
  bedType: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  floor: z.number().int().optional(),
  status: RoomStatusSchema.default('available'),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Room = z.infer<typeof RoomSchema>;

// Create Room Input
export const CreateRoomSchema = RoomSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

// Update Room Input
export const UpdateRoomSchema = RoomSchema.partial().omit({
  id: true,
  propertyId: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;

// Room with availability (for booking search)
export const RoomAvailabilitySchema = RoomSchema.extend({
  isAvailable: z.boolean(),
  nextAvailableDate: z.coerce.date().optional(),
});

export type RoomAvailability = z.infer<typeof RoomAvailabilitySchema>;

// Update Room Status
export const UpdateRoomStatusSchema = z.object({
  status: RoomStatusSchema,
  notes: z.string().optional(),
});

export type UpdateRoomStatusInput = z.infer<typeof UpdateRoomStatusSchema>;
