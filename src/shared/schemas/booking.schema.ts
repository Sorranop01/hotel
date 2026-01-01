import { z } from 'zod';
import { BOOKING_STATUS } from '../constants';

// Booking Status Enum
export const BookingStatusSchema = z.enum([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.CHECKED_OUT,
  BOOKING_STATUS.CANCELLED,
]);

// Guest Info Schema (embedded in Booking)
export const GuestInfoSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรไม่ถูกต้อง'),
  idNumber: z.string().optional(),
  nationality: z.string().default('Thai'),
  specialRequests: z.string().optional(),
});

export type GuestInfo = z.infer<typeof GuestInfoSchema>;

// Booking Schema
export const BookingSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  roomId: z.string(),
  bookingNumber: z.string(),
  guest: GuestInfoSchema,
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  nights: z.number().int().min(1),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  roomPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  paidAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'promptpay', 'transfer', 'card']).optional(),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).default('pending'),
  status: BookingStatusSchema.default('pending'),
  accessCode: z.string().length(6).optional(),
  accessCodeExpiry: z.coerce.date().optional(),
  notes: z.string().optional(),
  source: z.enum(['direct', 'walk-in', 'phone', 'other']).default('direct'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Booking = z.infer<typeof BookingSchema>;

// Create Booking Input (Guest self-booking)
export const CreateBookingSchema = z.object({
  propertyId: z.string(),
  roomId: z.string(),
  guest: GuestInfoSchema,
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  specialRequests: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'วันเช็คเอาท์ต้องหลังวันเช็คอิน',
  path: ['checkOut'],
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// Admin Create Booking (with more options)
export const AdminCreateBookingSchema = z.object({
  propertyId: z.string(),
  roomId: z.string(),
  guest: GuestInfoSchema,
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(['cash', 'promptpay', 'transfer', 'card']).optional(),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  source: z.enum(['direct', 'walk-in', 'phone', 'other']).default('walk-in'),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'วันเช็คเอาท์ต้องหลังวันเช็คอิน',
  path: ['checkOut'],
});

export type AdminCreateBookingInput = z.infer<typeof AdminCreateBookingSchema>;

// Update Booking Input
export const UpdateBookingSchema = z.object({
  guest: GuestInfoSchema.partial().optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentMethod: z.enum(['cash', 'promptpay', 'transfer', 'card']).optional(),
  notes: z.string().optional(),
});

export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;

// Update Booking Status
export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusSchema,
  notes: z.string().optional(),
});

export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;

// Search Bookings Query
export const SearchBookingsSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().optional(),
  status: BookingStatusSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
});

export type SearchBookingsQuery = z.infer<typeof SearchBookingsSchema>;

// Booking List Item (for calendar/list view)
export const BookingListItemSchema = BookingSchema.pick({
  id: true,
  bookingNumber: true,
  roomId: true,
  checkIn: true,
  checkOut: true,
  status: true,
  totalPrice: true,
  paymentStatus: true,
}).extend({
  guestName: z.string(),
  roomName: z.string(),
});

export type BookingListItem = z.infer<typeof BookingListItemSchema>;
