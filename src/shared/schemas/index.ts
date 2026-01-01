// User & Auth
export {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
  RegisterSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  type LoginInput,
  type RegisterInput,
} from './user.schema';

// Property
export {
  PropertySchema,
  CreatePropertySchema,
  UpdatePropertySchema,
  PropertyListItemSchema,
  type Property,
  type CreatePropertyInput,
  type UpdatePropertyInput,
  type PropertyListItem,
} from './property.schema';

// Room
export {
  RoomSchema,
  RoomStatusSchema,
  RoomTypeSchema,
  CreateRoomSchema,
  UpdateRoomSchema,
  UpdateRoomStatusSchema,
  RoomAvailabilitySchema,
  type Room,
  type CreateRoomInput,
  type UpdateRoomInput,
  type UpdateRoomStatusInput,
  type RoomAvailability,
} from './room.schema';

// Re-export types from constants
export type { RoomStatus, BookingStatus, RoomType } from '../constants';

// Booking
export {
  BookingSchema,
  BookingStatusSchema,
  GuestInfoSchema,
  CreateBookingSchema,
  AdminCreateBookingSchema,
  UpdateBookingSchema,
  UpdateBookingStatusSchema,
  SearchBookingsSchema,
  BookingListItemSchema,
  type Booking,
  type GuestInfo,
  type CreateBookingInput,
  type AdminCreateBookingInput,
  type UpdateBookingInput,
  type UpdateBookingStatusInput,
  type SearchBookingsQuery,
  type BookingListItem,
} from './booking.schema';

// Access Code
export {
  AccessCodeSchema,
  GenerateAccessCodeSchema,
  ValidateAccessCodeSchema,
  AccessCodeValidationResultSchema,
  RevokeAccessCodeSchema,
  AccessCodeListItemSchema,
  AccessCodeHistorySchema,
  type AccessCode,
  type GenerateAccessCodeInput,
  type ValidateAccessCodeInput,
  type AccessCodeValidationResult,
  type RevokeAccessCodeInput,
  type AccessCodeListItem,
  type AccessCodeHistory,
} from './access-code.schema';

// API Response
export {
  ApiResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  PaginationQuerySchema,
  PaginatedResponseSchema,
  ERROR_CODES,
  type ErrorResponse,
  type PaginationQuery,
  type ErrorCode,
} from './api-response.schema';
