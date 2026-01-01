import { Router } from 'express';
import { accessCodeRepository, bookingRepository, propertyRepository } from '../repositories';
import {
  authMiddleware,
  validate,
  asyncHandler,
  NotFoundError,
  ForbiddenError,
} from '../middleware';
import {
  GenerateAccessCodeSchema,
  ValidateAccessCodeSchema,
  RevokeAccessCodeSchema,
} from '@shared/schemas';

const router = Router();

// Check property ownership
async function checkPropertyOwnership(propertyId: string, userId: string): Promise<void> {
  const isOwner = await propertyRepository.isOwner(propertyId, userId);
  if (!isOwner) {
    throw ForbiddenError('Not authorized to access this property');
  }
}

// GET /api/access-codes?propertyId=xxx - Get access codes for property
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { propertyId, includeExpired } = req.query;

    if (!propertyId || typeof propertyId !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'propertyId is required' },
      });
      return;
    }

    await checkPropertyOwnership(propertyId, req.user!.uid);

    const codes = await accessCodeRepository.findByProperty(
      propertyId,
      includeExpired === 'true'
    );

    // Enrich with booking info
    const codesWithBooking = await Promise.all(
      codes.map(async (code) => {
        const booking = await bookingRepository.findById(code.bookingId);
        return {
          ...code,
          bookingNumber: booking?.bookingNumber,
          guestName: booking ? `${booking.guest.firstName} ${booking.guest.lastName}` : null,
        };
      })
    );

    res.json({
      success: true,
      data: codesWithBooking,
    });
  })
);

// GET /api/access-codes/booking/:bookingId - Get access codes for a booking
router.get(
  '/booking/:bookingId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.bookingId);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const codes = await accessCodeRepository.findByBooking(req.params.bookingId);

    res.json({
      success: true,
      data: codes,
    });
  })
);

// POST /api/access-codes/generate - Generate new access code
router.post(
  '/generate',
  authMiddleware,
  validate(GenerateAccessCodeSchema),
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.body.bookingId);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const code = await accessCodeRepository.generateCode(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: code.id,
        code: code.code,
        validFrom: code.validFrom,
        validUntil: code.validUntil,
        bookingId: code.bookingId,
      },
    });
  })
);

// POST /api/access-codes/regenerate/:bookingId - Regenerate access code
router.post(
  '/regenerate/:bookingId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.bookingId);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const code = await accessCodeRepository.regenerateCode(req.params.bookingId);

    res.json({
      success: true,
      data: {
        id: code.id,
        code: code.code,
        validFrom: code.validFrom,
        validUntil: code.validUntil,
      },
    });
  })
);

// POST /api/access-codes/validate - Validate access code (public - for keypad/check-in)
router.post(
  '/validate',
  validate(ValidateAccessCodeSchema),
  asyncHandler(async (req, res) => {
    const result = await accessCodeRepository.validateCode(
      req.body.code,
      req.body.propertyId
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

// POST /api/access-codes/use/:code - Mark code as used (for door unlock)
router.post(
  '/use/:code',
  asyncHandler(async (req, res) => {
    // First validate
    const validation = await accessCodeRepository.validateCode(req.params.code);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: { code: 'CODE_INVALID', message: validation.message },
      });
      return;
    }

    // Mark as used
    const code = await accessCodeRepository.markAsUsed(req.params.code);

    if (!code) {
      throw NotFoundError('Access code');
    }

    // Check in guest if not already
    const booking = await bookingRepository.findById(code.bookingId);
    if (booking && booking.status === 'confirmed') {
      await bookingRepository.checkIn(booking.id);
    }

    res.json({
      success: true,
      data: {
        message: 'Access granted',
        booking: validation.booking,
      },
    });
  })
);

// POST /api/access-codes/:id/revoke - Revoke access code
router.post(
  '/:id/revoke',
  authMiddleware,
  validate(RevokeAccessCodeSchema),
  asyncHandler(async (req, res) => {
    const code = await accessCodeRepository.findById(req.params.id);

    if (!code) {
      throw NotFoundError('Access code');
    }

    await checkPropertyOwnership(code.propertyId, req.user!.uid);

    const revoked = await accessCodeRepository.revoke(req.params.id, req.body.reason);

    res.json({
      success: true,
      data: revoked,
    });
  })
);

// POST /api/access-codes/cleanup/:propertyId - Cleanup expired codes
router.post(
  '/cleanup/:propertyId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    await checkPropertyOwnership(req.params.propertyId, req.user!.uid);

    const count = await accessCodeRepository.cleanupExpiredCodes(req.params.propertyId);

    res.json({
      success: true,
      data: {
        cleanedCount: count,
      },
    });
  })
);

export default router;
