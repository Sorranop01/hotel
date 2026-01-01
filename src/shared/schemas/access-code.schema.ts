import { z } from 'zod';
import { ACCESS_CODE_LENGTH } from '../constants';

// Access Code Schema
export const AccessCodeSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  propertyId: z.string(),
  roomId: z.string(),
  code: z.string().length(ACCESS_CODE_LENGTH, `รหัสต้องมี ${ACCESS_CODE_LENGTH} หลัก`),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isUsed: z.boolean().default(false),
  usedAt: z.coerce.date().optional(),
  isRevoked: z.boolean().default(false),
  revokedAt: z.coerce.date().optional(),
  revokedReason: z.string().optional(),
  createdAt: z.coerce.date(),
});

export type AccessCode = z.infer<typeof AccessCodeSchema>;

// Generate Access Code Input
export const GenerateAccessCodeSchema = z.object({
  bookingId: z.string(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  notifyGuest: z.boolean().default(true),
  notifyMethod: z.enum(['line', 'sms', 'email', 'all']).default('line'),
});

export type GenerateAccessCodeInput = z.infer<typeof GenerateAccessCodeSchema>;

// Validate Access Code Input (guest entering code)
export const ValidateAccessCodeSchema = z.object({
  code: z.string().length(ACCESS_CODE_LENGTH, `รหัสต้องมี ${ACCESS_CODE_LENGTH} หลัก`),
  propertyId: z.string().optional(),
});

export type ValidateAccessCodeInput = z.infer<typeof ValidateAccessCodeSchema>;

// Access Code Validation Result
export const AccessCodeValidationResultSchema = z.object({
  isValid: z.boolean(),
  message: z.string(),
  booking: z.object({
    id: z.string(),
    guestName: z.string(),
    roomName: z.string(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  }).optional(),
});

export type AccessCodeValidationResult = z.infer<typeof AccessCodeValidationResultSchema>;

// Revoke Access Code Input
export const RevokeAccessCodeSchema = z.object({
  reason: z.string().min(1, 'กรุณาระบุเหตุผล'),
});

export type RevokeAccessCodeInput = z.infer<typeof RevokeAccessCodeSchema>;

// Access Code List Item
export const AccessCodeListItemSchema = AccessCodeSchema.pick({
  id: true,
  code: true,
  validFrom: true,
  validUntil: true,
  isUsed: true,
  usedAt: true,
  isRevoked: true,
}).extend({
  bookingNumber: z.string(),
  guestName: z.string(),
  roomName: z.string(),
});

export type AccessCodeListItem = z.infer<typeof AccessCodeListItemSchema>;

// Access Code History Entry
export const AccessCodeHistorySchema = z.object({
  id: z.string(),
  accessCodeId: z.string(),
  action: z.enum(['created', 'used', 'revoked', 'expired', 'regenerated']),
  timestamp: z.coerce.date(),
  details: z.string().optional(),
  performedBy: z.string().optional(),
});

export type AccessCodeHistory = z.infer<typeof AccessCodeHistorySchema>;
