import { COLLECTIONS } from '../config';
import { BaseRepository } from './base.repository';
import { propertyRepository } from './property.repository';
import { ROOM_STATUS, type RoomStatus } from '@shared/constants';
import type { Room, CreateRoomInput, UpdateRoomInput } from '@shared/schemas';

interface RoomEntity extends Room {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class RoomRepository extends BaseRepository<RoomEntity> {
  constructor() {
    super(COLLECTIONS.ROOMS);
  }

  async findByProperty(propertyId: string): Promise<RoomEntity[]> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('isActive', '==', true)
      .orderBy('roomNumber', 'asc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findByPropertyAndStatus(propertyId: string, status: RoomStatus): Promise<RoomEntity[]> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('status', '==', status)
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findAvailableRooms(propertyId: string): Promise<RoomEntity[]> {
    return this.findByPropertyAndStatus(propertyId, ROOM_STATUS.AVAILABLE);
  }

  async createRoom(data: CreateRoomInput): Promise<RoomEntity> {
    const roomData = {
      ...data,
      status: ROOM_STATUS.AVAILABLE as RoomStatus,
      isActive: true,
    };

    const room = await this.create(roomData as Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt'>);

    // Update property room count
    await propertyRepository.updateRoomCount(data.propertyId, 1);

    return room;
  }

  async updateRoom(id: string, data: UpdateRoomInput): Promise<RoomEntity | null> {
    return this.update(id, data);
  }

  async updateStatus(id: string, status: RoomStatus): Promise<RoomEntity | null> {
    return this.update(id, { status });
  }

  async setOccupied(id: string): Promise<RoomEntity | null> {
    return this.updateStatus(id, ROOM_STATUS.OCCUPIED);
  }

  async setAvailable(id: string): Promise<RoomEntity | null> {
    return this.updateStatus(id, ROOM_STATUS.AVAILABLE);
  }

  async setCleaning(id: string): Promise<RoomEntity | null> {
    return this.updateStatus(id, ROOM_STATUS.CLEANING);
  }

  async setMaintenance(id: string): Promise<RoomEntity | null> {
    return this.updateStatus(id, ROOM_STATUS.MAINTENANCE);
  }

  async deleteRoom(id: string): Promise<boolean> {
    const room = await this.findById(id);
    if (!room) return false;

    // Soft delete
    await this.update(id, { isActive: false });

    // Update property room count
    await propertyRepository.updateRoomCount(room.propertyId, -1);

    return true;
  }

  async findByRoomNumber(propertyId: string, roomNumber: string): Promise<RoomEntity | null> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('roomNumber', '==', roomNumber)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async countByProperty(propertyId: string): Promise<number> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('isActive', '==', true)
      .count()
      .get();

    return snapshot.data().count;
  }

  async countAvailableByProperty(propertyId: string): Promise<number> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('status', '==', ROOM_STATUS.AVAILABLE)
      .where('isActive', '==', true)
      .count()
      .get();

    return snapshot.data().count;
  }

  async getRoomStats(propertyId: string): Promise<Record<RoomStatus, number>> {
    const rooms = await this.findByProperty(propertyId);

    const stats = {
      [ROOM_STATUS.AVAILABLE]: 0,
      [ROOM_STATUS.OCCUPIED]: 0,
      [ROOM_STATUS.CLEANING]: 0,
      [ROOM_STATUS.MAINTENANCE]: 0,
    };

    for (const room of rooms) {
      stats[room.status]++;
    }

    return stats;
  }
}

export const roomRepository = new RoomRepository();
export default roomRepository;
