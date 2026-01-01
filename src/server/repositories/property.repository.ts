import { COLLECTIONS } from '../config';
import { BaseRepository } from './base.repository';
import type { Property, CreatePropertyInput, UpdatePropertyInput } from '@shared/schemas';

interface PropertyEntity extends Property {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generate URL-friendly slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

class PropertyRepository extends BaseRepository<PropertyEntity> {
  constructor() {
    super(COLLECTIONS.PROPERTIES);
  }

  async findByOwner(ownerId: string): Promise<PropertyEntity[]> {
    const snapshot = await this.collection
      .where('ownerId', '==', ownerId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findBySlug(slug: string): Promise<PropertyEntity | null> {
    const snapshot = await this.collection
      .where('slug', '==', slug)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async createForOwner(ownerId: string, data: CreatePropertyInput): Promise<PropertyEntity> {
    // Generate unique slug
    let slug = generateSlug(data.name);
    let slugExists = await this.findBySlug(slug);
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(data.name)}-${counter}`;
      slugExists = await this.findBySlug(slug);
      counter++;
    }

    const propertyData = {
      ...data,
      ownerId,
      slug,
      totalRooms: 0,
      isActive: true,
    };

    return this.create(propertyData as Omit<PropertyEntity, 'id' | 'createdAt' | 'updatedAt'>);
  }

  async updateProperty(id: string, ownerId: string, data: UpdatePropertyInput): Promise<PropertyEntity | null> {
    // Verify ownership
    const property = await this.findById(id);
    if (!property || property.ownerId !== ownerId) return null;

    // If name changed, update slug
    if (data.name && data.name !== property.name) {
      let slug = generateSlug(data.name);
      let slugExists = await this.findBySlug(slug);
      let counter = 1;

      while (slugExists && slugExists.id !== id) {
        slug = `${generateSlug(data.name)}-${counter}`;
        slugExists = await this.findBySlug(slug);
        counter++;
      }

      data.slug = slug;
    }

    return this.update(id, data);
  }

  async updateRoomCount(id: string, delta: number): Promise<void> {
    const property = await this.findById(id);
    if (!property) return;

    await this.update(id, {
      totalRooms: Math.max(0, property.totalRooms + delta),
    });
  }

  async isOwner(propertyId: string, ownerId: string): Promise<boolean> {
    const property = await this.findById(propertyId);
    return property?.ownerId === ownerId;
  }

  async findActiveByProvince(province: string): Promise<PropertyEntity[]> {
    const snapshot = await this.collection
      .where('province', '==', province)
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }
}

export const propertyRepository = new PropertyRepository();
export default propertyRepository;
