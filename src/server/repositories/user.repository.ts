import { COLLECTIONS } from '../config';
import { BaseRepository } from './base.repository';
import type { User, CreateUserInput, UpdateUserInput } from '@shared/schemas';

interface UserEntity extends User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const snapshot = await this.collection
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async findByFirebaseUid(uid: string): Promise<UserEntity | null> {
    // Firebase UID is used as document ID
    return this.findById(uid);
  }

  async createWithUid(uid: string, data: CreateUserInput): Promise<UserEntity> {
    const now = new Date();

    const entity: UserEntity = {
      ...data,
      id: uid,
      role: data.role || 'owner',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(uid).set(entity);
    return entity;
  }

  async updateProfile(id: string, data: UpdateUserInput): Promise<UserEntity | null> {
    return this.update(id, data);
  }

  async findActiveOwners(): Promise<UserEntity[]> {
    const snapshot = await this.collection
      .where('role', '==', 'owner')
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async deactivate(id: string): Promise<UserEntity | null> {
    return this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<UserEntity | null> {
    return this.update(id, { isActive: true });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
