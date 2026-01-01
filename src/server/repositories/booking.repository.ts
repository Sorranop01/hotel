import { COLLECTIONS } from '../config';
import { BaseRepository } from './base.repository';
import { roomRepository } from './room.repository';
import { BOOKING_STATUS, type BookingStatus } from '@shared/constants';
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  SearchBookingsQuery,
} from '@shared/schemas';

interface BookingEntity extends Booking {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generate booking number: BK-YYYYMMDD-XXXX
function generateBookingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${dateStr}-${random}`;
}

// Calculate nights between two dates
function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

class BookingRepository extends BaseRepository<BookingEntity> {
  constructor() {
    super(COLLECTIONS.BOOKINGS);
  }

  async findByProperty(propertyId: string, limit = 50): Promise<BookingEntity[]> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findByRoom(roomId: string): Promise<BookingEntity[]> {
    const snapshot = await this.collection
      .where('roomId', '==', roomId)
      .orderBy('checkIn', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findByStatus(propertyId: string, status: BookingStatus): Promise<BookingEntity[]> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findByDateRange(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BookingEntity[]> {
    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('checkIn', '>=', startDate)
      .where('checkIn', '<=', endDate)
      .orderBy('checkIn', 'asc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findByBookingNumber(bookingNumber: string): Promise<BookingEntity | null> {
    const snapshot = await this.collection
      .where('bookingNumber', '==', bookingNumber)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async findByAccessCode(code: string): Promise<BookingEntity | null> {
    const snapshot = await this.collection
      .where('accessCode', '==', code)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async search(query: SearchBookingsQuery): Promise<BookingEntity[]> {
    let firestoreQuery = this.collection.orderBy('createdAt', 'desc');

    if (query.propertyId) {
      firestoreQuery = firestoreQuery.where('propertyId', '==', query.propertyId);
    }

    if (query.roomId) {
      firestoreQuery = firestoreQuery.where('roomId', '==', query.roomId);
    }

    if (query.status) {
      firestoreQuery = firestoreQuery.where('status', '==', query.status);
    }

    const snapshot = await firestoreQuery.limit(100).get();
    let results = snapshot.docs.map((doc) => doc.data());

    // Client-side filtering for complex queries
    if (query.fromDate) {
      results = results.filter((b) => b.checkIn >= query.fromDate!);
    }

    if (query.toDate) {
      results = results.filter((b) => b.checkIn <= query.toDate!);
    }

    if (query.guestName) {
      const searchName = query.guestName.toLowerCase();
      results = results.filter(
        (b) =>
          b.guest.firstName.toLowerCase().includes(searchName) ||
          b.guest.lastName.toLowerCase().includes(searchName)
      );
    }

    if (query.guestPhone) {
      results = results.filter((b) => b.guest.phoneNumber.includes(query.guestPhone!));
    }

    return results;
  }

  async isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string): Promise<boolean> {
    // Find overlapping bookings
    const snapshot = await this.collection
      .where('roomId', '==', roomId)
      .where('status', 'in', [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN])
      .get();

    const bookings = snapshot.docs.map((doc) => doc.data());

    for (const booking of bookings) {
      // Skip the current booking if updating
      if (excludeBookingId && booking.id === excludeBookingId) continue;

      // Check for overlap
      const bookingStart = booking.checkIn;
      const bookingEnd = booking.checkOut;

      // Overlap occurs if: checkIn < bookingEnd AND checkOut > bookingStart
      if (checkIn < bookingEnd && checkOut > bookingStart) {
        return false;
      }
    }

    return true;
  }

  async createBooking(data: CreateBookingInput, roomPrice: number): Promise<BookingEntity> {
    const nights = calculateNights(data.checkIn, data.checkOut);
    const totalPrice = roomPrice * nights;

    const bookingData = {
      ...data,
      bookingNumber: generateBookingNumber(),
      nights,
      roomPrice,
      totalPrice,
      paidAmount: 0,
      paymentStatus: 'pending' as const,
      status: BOOKING_STATUS.PENDING as BookingStatus,
      source: 'direct' as const,
    };

    return this.create(bookingData as Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>);
  }

  async updateBooking(id: string, data: UpdateBookingInput): Promise<BookingEntity | null> {
    const booking = await this.findById(id);
    if (!booking) return null;

    // Recalculate if dates changed
    const updateData: Partial<BookingEntity> = {};

    if (data.checkIn) updateData.checkIn = data.checkIn;
    if (data.checkOut) updateData.checkOut = data.checkOut;
    if (data.adults) updateData.adults = data.adults;
    if (data.children !== undefined) updateData.children = data.children;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Merge guest data if provided
    if (data.guest) {
      updateData.guest = { ...booking.guest, ...data.guest };
    }

    if (data.checkIn || data.checkOut) {
      const checkIn = data.checkIn || booking.checkIn;
      const checkOut = data.checkOut || booking.checkOut;
      const nights = calculateNights(checkIn, checkOut);
      updateData.nights = nights;
      updateData.totalPrice = booking.roomPrice * nights;
    }

    return this.update(id, updateData);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingEntity | null> {
    const booking = await this.findById(id);
    if (!booking) return null;

    // Update room status based on booking status
    if (status === BOOKING_STATUS.CHECKED_IN) {
      await roomRepository.setOccupied(booking.roomId);
    } else if (status === BOOKING_STATUS.CHECKED_OUT) {
      await roomRepository.setCleaning(booking.roomId);
    } else if (status === BOOKING_STATUS.CANCELLED) {
      // If was checked in, set room to cleaning
      if (booking.status === BOOKING_STATUS.CHECKED_IN) {
        await roomRepository.setCleaning(booking.roomId);
      }
    }

    return this.update(id, { status });
  }

  async checkIn(id: string): Promise<BookingEntity | null> {
    return this.updateStatus(id, BOOKING_STATUS.CHECKED_IN);
  }

  async checkOut(id: string): Promise<BookingEntity | null> {
    return this.updateStatus(id, BOOKING_STATUS.CHECKED_OUT);
  }

  async cancel(id: string): Promise<BookingEntity | null> {
    return this.updateStatus(id, BOOKING_STATUS.CANCELLED);
  }

  async confirm(id: string): Promise<BookingEntity | null> {
    return this.updateStatus(id, BOOKING_STATUS.CONFIRMED);
  }

  async setAccessCode(id: string, code: string, expiry: Date): Promise<BookingEntity | null> {
    return this.update(id, {
      accessCode: code,
      accessCodeExpiry: expiry,
    });
  }

  async updatePayment(
    id: string,
    paidAmount: number,
    paymentMethod?: 'cash' | 'promptpay' | 'transfer' | 'card'
  ): Promise<BookingEntity | null> {
    const booking = await this.findById(id);
    if (!booking) return null;

    const newPaidAmount = booking.paidAmount + paidAmount;
    let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';

    if (newPaidAmount >= booking.totalPrice) {
      paymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
    }

    return this.update(id, {
      paidAmount: newPaidAmount,
      paymentStatus,
      paymentMethod: paymentMethod || booking.paymentMethod,
    });
  }

  async getTodayCheckIns(propertyId: string): Promise<BookingEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('checkIn', '>=', today)
      .where('checkIn', '<', tomorrow)
      .where('status', '==', BOOKING_STATUS.CONFIRMED)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async getTodayCheckOuts(propertyId: string): Promise<BookingEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('checkOut', '>=', today)
      .where('checkOut', '<', tomorrow)
      .where('status', '==', BOOKING_STATUS.CHECKED_IN)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }
}

export const bookingRepository = new BookingRepository();
export default bookingRepository;
