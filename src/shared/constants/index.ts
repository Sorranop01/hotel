// Room status
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
} as const;

export type RoomStatus = typeof ROOM_STATUS[keyof typeof ROOM_STATUS];

// Booking status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Room types
export const ROOM_TYPE = {
  STANDARD: 'standard',
  DELUXE: 'deluxe',
  DORMITORY: 'dormitory',
  SUITE: 'suite',
} as const;

export type RoomType = typeof ROOM_TYPE[keyof typeof ROOM_TYPE];

// Access code length
export const ACCESS_CODE_LENGTH = 6;

// Access code validity (hours)
export const ACCESS_CODE_VALIDITY_HOURS = 24;
