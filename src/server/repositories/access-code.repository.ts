import { COLLECTIONS } from '../config';
import { BaseRepository } from './base.repository';
import { bookingRepository } from './booking.repository';
import { ACCESS_CODE_LENGTH, ACCESS_CODE_VALIDITY_HOURS } from '@shared/constants';
import type {
  AccessCode,
  GenerateAccessCodeInput,
  AccessCodeValidationResult,
} from '@shared/schemas';

interface AccessCodeEntity extends Omit<AccessCode, 'createdAt'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generate random numeric code
function generateRandomCode(length: number = ACCESS_CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

class AccessCodeRepository extends BaseRepository<AccessCodeEntity> {
  constructor() {
    super(COLLECTIONS.ACCESS_CODES);
  }

  async findByCode(code: string): Promise<AccessCodeEntity | null> {
    const snapshot = await this.collection
      .where('code', '==', code)
      .where('isRevoked', '==', false)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async findByBooking(bookingId: string): Promise<AccessCodeEntity[]> {
    const snapshot = await this.collection
      .where('bookingId', '==', bookingId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findActiveByBooking(bookingId: string): Promise<AccessCodeEntity | null> {
    const now = new Date();

    const snapshot = await this.collection
      .where('bookingId', '==', bookingId)
      .where('isRevoked', '==', false)
      .where('isUsed', '==', false)
      .where('validUntil', '>', now)
      .orderBy('validUntil', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  async findByProperty(propertyId: string, includeExpired = false): Promise<AccessCodeEntity[]> {
    let query = this.collection
      .where('propertyId', '==', propertyId)
      .where('isRevoked', '==', false);

    if (!includeExpired) {
      const now = new Date();
      query = query.where('validUntil', '>', now);
    }

    const snapshot = await query.orderBy('validUntil', 'desc').get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async generateCode(input: GenerateAccessCodeInput): Promise<AccessCodeEntity> {
    const booking = await bookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Generate unique code
    let code = generateRandomCode();
    let existingCode = await this.findByCode(code);
    let attempts = 0;

    while (existingCode && attempts < 10) {
      code = generateRandomCode();
      existingCode = await this.findByCode(code);
      attempts++;
    }

    if (existingCode) {
      throw new Error('Failed to generate unique code');
    }

    // Calculate validity period
    const validFrom = input.validFrom || booking.checkIn;
    const validUntil = input.validUntil || new Date(
      booking.checkOut.getTime() + ACCESS_CODE_VALIDITY_HOURS * 60 * 60 * 1000
    );

    const accessCodeData = {
      bookingId: input.bookingId,
      propertyId: booking.propertyId,
      roomId: booking.roomId,
      code,
      validFrom,
      validUntil,
      isUsed: false,
      isRevoked: false,
    };

    const accessCode = await this.create(
      accessCodeData as Omit<AccessCodeEntity, 'id' | 'createdAt' | 'updatedAt'>
    );

    // Update booking with access code
    await bookingRepository.setAccessCode(input.bookingId, code, validUntil);

    return accessCode;
  }

  async validateCode(code: string, propertyId?: string): Promise<AccessCodeValidationResult> {
    const accessCode = await this.findByCode(code);

    if (!accessCode) {
      return {
        isValid: false,
        message: 'รหัสไม่ถูกต้อง',
      };
    }

    // Check property match if provided
    if (propertyId && accessCode.propertyId !== propertyId) {
      return {
        isValid: false,
        message: 'รหัสไม่ถูกต้องสำหรับที่พักนี้',
      };
    }

    // Check if revoked
    if (accessCode.isRevoked) {
      return {
        isValid: false,
        message: 'รหัสถูกยกเลิกแล้ว',
      };
    }

    // Check if already used
    if (accessCode.isUsed) {
      return {
        isValid: false,
        message: 'รหัสถูกใช้งานแล้ว',
      };
    }

    // Check validity period
    const now = new Date();
    if (now < accessCode.validFrom) {
      return {
        isValid: false,
        message: 'รหัสยังไม่เริ่มใช้งาน',
      };
    }

    if (now > accessCode.validUntil) {
      return {
        isValid: false,
        message: 'รหัสหมดอายุแล้ว',
      };
    }

    // Get booking info
    const booking = await bookingRepository.findById(accessCode.bookingId);
    if (!booking) {
      return {
        isValid: false,
        message: 'ไม่พบข้อมูลการจอง',
      };
    }

    return {
      isValid: true,
      message: 'รหัสถูกต้อง',
      booking: {
        id: booking.id,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        roomName: booking.roomId, // Would need to join with room data
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      },
    };
  }

  async markAsUsed(code: string): Promise<AccessCodeEntity | null> {
    const accessCode = await this.findByCode(code);
    if (!accessCode) return null;

    return this.update(accessCode.id, {
      isUsed: true,
      usedAt: new Date(),
    });
  }

  async revoke(id: string, reason: string): Promise<AccessCodeEntity | null> {
    return this.update(id, {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    });
  }

  async revokeByBooking(bookingId: string, reason: string): Promise<number> {
    const codes = await this.findByBooking(bookingId);
    let revokedCount = 0;

    for (const code of codes) {
      if (!code.isRevoked) {
        await this.revoke(code.id, reason);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  async regenerateCode(bookingId: string): Promise<AccessCodeEntity> {
    // Revoke existing codes
    await this.revokeByBooking(bookingId, 'Regenerated');

    // Generate new code
    return this.generateCode({ bookingId, notifyGuest: true, notifyMethod: 'line' });
  }

  async getExpiredCodes(propertyId: string): Promise<AccessCodeEntity[]> {
    const now = new Date();

    const snapshot = await this.collection
      .where('propertyId', '==', propertyId)
      .where('isRevoked', '==', false)
      .where('validUntil', '<', now)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async cleanupExpiredCodes(propertyId: string): Promise<number> {
    const expiredCodes = await this.getExpiredCodes(propertyId);
    let cleanedCount = 0;

    for (const code of expiredCodes) {
      await this.revoke(code.id, 'Expired');
      cleanedCount++;
    }

    return cleanedCount;
  }
}

export const accessCodeRepository = new AccessCodeRepository();
export default accessCodeRepository;
