// Firestore Collection Names (Single Source of Truth)
export const COLLECTIONS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  ROOMS: 'rooms',
  BOOKINGS: 'bookings',
  ACCESS_CODES: 'accessCodes',
  ACCESS_CODE_HISTORY: 'accessCodeHistory',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
