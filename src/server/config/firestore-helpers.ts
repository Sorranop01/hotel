import {
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentReference,
  type CollectionReference,
  Timestamp,
  FieldValue,
} from 'firebase-admin/firestore';
import { db } from './firebase';

// Convert Firestore Timestamp to Date
export function timestampToDate(timestamp: Timestamp | Date | undefined): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

// Convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date | undefined): Timestamp | undefined {
  if (!date) return undefined;
  return Timestamp.fromDate(date);
}

// Generic document converter
export function createConverter<T extends DocumentData>() {
  return {
    toFirestore(data: T): DocumentData {
      const result: DocumentData = { ...data };

      // Remove id field (it's stored as document ID)
      delete result.id;

      // Convert Date fields to Timestamp
      for (const key of Object.keys(result)) {
        if (result[key] instanceof Date) {
          result[key] = Timestamp.fromDate(result[key]);
        }
      }

      return result;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();

      // Add id from document ID
      const result: DocumentData = {
        id: snapshot.id,
        ...data,
      };

      // Convert Timestamp fields to Date
      for (const key of Object.keys(result)) {
        if (result[key] instanceof Timestamp) {
          result[key] = result[key].toDate();
        }
      }

      return result as T;
    },
  };
}

// Get typed collection reference
export function getCollection<T extends DocumentData>(
  collectionName: string
): CollectionReference<T> {
  return db.collection(collectionName).withConverter(createConverter<T>());
}

// Get typed document reference
export function getDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): DocumentReference<T> {
  return db.collection(collectionName).doc(docId).withConverter(createConverter<T>());
}

// Generate unique ID
export function generateId(collectionName: string): string {
  return db.collection(collectionName).doc().id;
}

// Server timestamp
export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

// Batch operations helper
export function createBatch() {
  return db.batch();
}

// Transaction helper
export async function runTransaction<T>(
  updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> {
  return db.runTransaction(updateFunction);
}

// Pagination helper
export interface PaginationParams {
  limit: number;
  startAfter?: QueryDocumentSnapshot;
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}
