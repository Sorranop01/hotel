import { Router } from 'express';
import { bookingRepository, roomRepository, propertyRepository, accessCodeRepository } from '../repositories';
import {
  authMiddleware,
  optionalAuthMiddleware,
  validate,
  asyncHandler,
  NotFoundError,
  ForbiddenError,
  AppError,
} from '../middleware';
import {
  CreateBookingSchema,
  AdminCreateBookingSchema,
  UpdateBookingSchema,
  UpdateBookingStatusSchema,
  SearchBookingsSchema,
} from '@shared/schemas';
import { z } from 'zod';

const router = Router();

// Check property ownership
async function checkPropertyOwnership(propertyId: string, userId: string): Promise<void> {
  const isOwner = await propertyRepository.isOwner(propertyId, userId);
  if (!isOwner) {
    throw ForbiddenError('Not authorized to access this property');
  }
}

// GET /api/bookings - Get bookings for a property
router.get(
  '/',
  authMiddleware,
  validate(SearchBookingsSchema, 'query'),
  asyncHandler(async (req, res) => {
    const query = req.query as z.infer<typeof SearchBookingsSchema>;

    if (!query.propertyId) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'propertyId is required' },
      });
      return;
    }

    await checkPropertyOwnership(query.propertyId, req.user!.uid);

    const bookings = await bookingRepository.search(query);

    res.json({
      success: true,
      data: bookings,
    });
  })
);

// GET /api/bookings/today - Get today's check-ins and check-outs
router.get(
  '/today/:propertyId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    await checkPropertyOwnership(req.params.propertyId, req.user!.uid);

    const [checkIns, checkOuts] = await Promise.all([
      bookingRepository.getTodayCheckIns(req.params.propertyId),
      bookingRepository.getTodayCheckOuts(req.params.propertyId),
    ]);

    res.json({
      success: true,
      data: {
        checkIns,
        checkOuts,
      },
    });
  })
);

// GET /api/bookings/:id - Get booking by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    // Get room details
    const room = await roomRepository.findById(booking.roomId);

    res.json({
      success: true,
      data: {
        ...booking,
        room: room ? {
          id: room.id,
          name: room.name,
          roomNumber: room.roomNumber,
          type: room.type,
        } : null,
      },
    });
  })
);

// GET /api/bookings/number/:bookingNumber - Get booking by booking number
router.get(
  '/number/:bookingNumber',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findByBookingNumber(req.params.bookingNumber);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    // If not authenticated, return limited data
    if (!req.user) {
      res.json({
        success: true,
        data: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: booking.status,
          guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        },
      });
      return;
    }

    await checkPropertyOwnership(booking.propertyId, req.user.uid);

    res.json({
      success: true,
      data: booking,
    });
  })
);

// POST /api/bookings - Create booking (public - guest self booking)
router.post(
  '/',
  optionalAuthMiddleware,
  validate(CreateBookingSchema),
  asyncHandler(async (req, res) => {
    const { propertyId, roomId, checkIn, checkOut } = req.body;

    // Check room exists
    const room = await roomRepository.findById(roomId);
    if (!room || room.propertyId !== propertyId) {
      throw NotFoundError('Room');
    }

    // Check availability
    const isAvailable = await bookingRepository.isRoomAvailable(roomId, checkIn, checkOut);
    if (!isAvailable) {
      throw new AppError('Room is not available for selected dates', 409, 'ROOM_NOT_AVAILABLE');
    }

    // Create booking
    const booking = await bookingRepository.createBooking(req.body, room.price);

    res.status(201).json({
      success: true,
      data: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  })
);

// POST /api/bookings/admin - Create booking (admin - walk-in, phone)
router.post(
  '/admin',
  authMiddleware,
  validate(AdminCreateBookingSchema),
  asyncHandler(async (req, res) => {
    const { propertyId, roomId, checkIn, checkOut } = req.body;

    await checkPropertyOwnership(propertyId, req.user!.uid);

    const room = await roomRepository.findById(roomId);
    if (!room || room.propertyId !== propertyId) {
      throw NotFoundError('Room');
    }

    const isAvailable = await bookingRepository.isRoomAvailable(roomId, checkIn, checkOut);
    if (!isAvailable) {
      throw new AppError('Room is not available for selected dates', 409, 'ROOM_NOT_AVAILABLE');
    }

    const booking = await bookingRepository.createBooking(req.body, room.price);

    // Auto-confirm admin bookings
    await bookingRepository.confirm(booking.id);

    // Generate access code
    const accessCode = await accessCodeRepository.generateCode({
      bookingId: booking.id,
      notifyGuest: true,
      notifyMethod: 'line',
    });

    res.status(201).json({
      success: true,
      data: {
        ...booking,
        status: 'confirmed',
        accessCode: accessCode.code,
      },
    });
  })
);

// PATCH /api/bookings/:id - Update booking
router.patch(
  '/:id',
  authMiddleware,
  validate(UpdateBookingSchema),
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    // If dates are changing, check availability
    if (req.body.checkIn || req.body.checkOut) {
      const checkIn = req.body.checkIn || booking.checkIn;
      const checkOut = req.body.checkOut || booking.checkOut;

      const isAvailable = await bookingRepository.isRoomAvailable(
        booking.roomId,
        checkIn,
        checkOut,
        booking.id // Exclude current booking
      );

      if (!isAvailable) {
        throw new AppError('Room is not available for selected dates', 409, 'ROOM_NOT_AVAILABLE');
      }
    }

    const updated = await bookingRepository.updateBooking(req.params.id, req.body);

    res.json({
      success: true,
      data: updated,
    });
  })
);

// PATCH /api/bookings/:id/status - Update booking status
router.patch(
  '/:id/status',
  authMiddleware,
  validate(UpdateBookingStatusSchema),
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const updated = await bookingRepository.updateStatus(req.params.id, req.body.status);

    res.json({
      success: true,
      data: updated,
    });
  })
);

// POST /api/bookings/:id/confirm - Confirm booking
router.post(
  '/:id/confirm',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const updated = await bookingRepository.confirm(req.params.id);

    // Generate access code
    const accessCode = await accessCodeRepository.generateCode({
      bookingId: req.params.id,
      notifyGuest: true,
      notifyMethod: 'line',
    });

    res.json({
      success: true,
      data: {
        ...updated,
        accessCode: accessCode.code,
      },
    });
  })
);

// POST /api/bookings/:id/checkin - Check in guest
router.post(
  '/:id/checkin',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const updated = await bookingRepository.checkIn(req.params.id);

    res.json({
      success: true,
      data: updated,
    });
  })
);

// POST /api/bookings/:id/checkout - Check out guest
router.post(
  '/:id/checkout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const updated = await bookingRepository.checkOut(req.params.id);

    // Revoke access codes
    await accessCodeRepository.revokeByBooking(req.params.id, 'Checked out');

    res.json({
      success: true,
      data: updated,
    });
  })
);

// POST /api/bookings/:id/cancel - Cancel booking
router.post(
  '/:id/cancel',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const updated = await bookingRepository.cancel(req.params.id);

    // Revoke access codes
    await accessCodeRepository.revokeByBooking(req.params.id, 'Booking cancelled');

    res.json({
      success: true,
      data: updated,
    });
  })
);

// POST /api/bookings/:id/payment - Record payment
router.post(
  '/:id/payment',
  authMiddleware,
  validate(z.object({
    amount: z.number().min(0),
    method: z.enum(['cash', 'promptpay', 'transfer', 'card']).optional(),
  })),
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);

    if (!booking) {
      throw NotFoundError('Booking');
    }

    await checkPropertyOwnership(booking.propertyId, req.user!.uid);

    const updated = await bookingRepository.updatePayment(
      req.params.id,
      req.body.amount,
      req.body.method
    );

    res.json({
      success: true,
      data: updated,
    });
  })
);

export default router;
