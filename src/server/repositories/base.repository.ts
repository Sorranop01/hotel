import {
  type DocumentData,
  type Query,
  type CollectionReference,
} from 'firebase-admin/firestore';
import { getCollection, generateId } from '../config';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string;
  protected collection: CollectionReference<T>;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = getCollection<T>(collectionName);
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as T;
  }

  async findAll(options: QueryOptions = {}): Promise<T[]> {
    let query: Query<T> = this.collection;

    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = generateId(this.collectionName);
    const now = new Date();

    const entity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    await this.collection.doc(id).set(entity as T & DocumentData);
    return entity;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await this.collection.doc(id).update(updateData as DocumentData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    await this.collection.doc(id).delete();
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const doc = await this.collection.doc(id).get();
    return doc.exists;
  }

  async count(): Promise<number> {
    const snapshot = await this.collection.count().get();
    return snapshot.data().count;
  }

  // Soft delete (mark as inactive instead of deleting)
  async softDelete(id: string): Promise<T | null> {
    return this.update(id, { isActive: false } as unknown as Partial<Omit<T, 'id' | 'createdAt'>>);
  }
}
