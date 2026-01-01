// Firebase
export { firebaseAdmin, app, auth, db, storage } from './firebase';

// Collections
export { COLLECTIONS, type CollectionName } from './collections';

// Firestore Helpers
export {
  timestampToDate,
  dateToTimestamp,
  createConverter,
  getCollection,
  getDocument,
  generateId,
  serverTimestamp,
  createBatch,
  runTransaction,
  type PaginationParams,
  type PaginatedResult,
} from './firestore-helpers';

// Environment config
export const config = {
  port: parseInt(process.env.API_PORT || '3000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};
