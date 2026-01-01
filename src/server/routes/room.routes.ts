import { Router } from 'express';
import { roomRepository, propertyRepository } from '../repositories';
import {
  authMiddleware,
  optionalAuthMiddleware,
  validate,
  asyncHandler,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../middleware';
import { CreateRoomSchema, UpdateRoomSchema, UpdateRoomStatusSchema } from '@shared/schemas';

const router = Router();

// Middleware to check property ownership
async function checkPropertyOwnership(
  propertyId: string,
  userId: string
): Promise<void> {
  const isOwner = await propertyRepository.isOwner(propertyId, userId);
  if (!isOwner) {
    throw ForbiddenError('Not authorized to access this property');
  }
}

// GET /api/rooms?propertyId=xxx - Get all rooms for a property
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.query;

    if (!propertyId || typeof propertyId !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'propertyId is required' },
      });
      return;
    }

    await checkPropertyOwnership(propertyId, req.user!.uid);

    const rooms = await roomRepository.findByProperty(propertyId);

    res.json({
      success: true,
      data: rooms,
    });
  })
);

// GET /api/rooms/available?propertyId=xxx - Get available rooms (public for booking)
router.get(
  '/available',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.query;

    if (!propertyId || typeof propertyId !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'propertyId is required' },
      });
      return;
    }

    const rooms = await roomRepository.findAvailableRooms(propertyId);

    // Return limited data for public
    const publicRooms = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      roomNumber: room.roomNumber,
      type: room.type,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      bedType: room.bedType,
      amenities: room.amenities,
      images: room.images,
    }));

    res.json({
      success: true,
      data: publicRooms,
    });
  })
);

// GET /api/rooms/:id - Get room by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const room = await roomRepository.findById(req.params.id);

    if (!room) {
      throw NotFoundError('Room');
    }

    await checkPropertyOwnership(room.propertyId, req.user!.uid);

    res.json({
      success: true,
      data: room,
    });
  })
);

// POST /api/rooms - Create new room
router.post(
  '/',
  authMiddleware,
  validate(CreateRoomSchema),
  asyncHandler(async (req, res) => {
    await checkPropertyOwnership(req.body.propertyId, req.user!.uid);

    // Check if room number already exists
    const existing = await roomRepository.findByRoomNumber(
      req.body.propertyId,
      req.body.roomNumber
    );

    if (existing) {
      throw ConflictError('Room number already exists');
    }

    const room = await roomRepository.createRoom(req.body);

    res.status(201).json({
      success: true,
      data: room,
    });
  })
);

// PATCH /api/rooms/:id - Update room
router.patch(
  '/:id',
  authMiddleware,
  validate(UpdateRoomSchema),
  asyncHandler(async (req, res) => {
    const room = await roomRepository.findById(req.params.id);

    if (!room) {
      throw NotFoundError('Room');
    }

    await checkPropertyOwnership(room.propertyId, req.user!.uid);

    // Check room number conflict if changing
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const existing = await roomRepository.findByRoomNumber(
        room.propertyId,
        req.body.roomNumber
      );
      if (existing) {
        throw ConflictError('Room number already exists');
      }
    }

    const updated = await roomRepository.updateRoom(req.params.id, req.body);

    res.json({
      success: true,
      data: updated,
    });
  })
);

// PATCH /api/rooms/:id/status - Update room status
router.patch(
  '/:id/status',
  authMiddleware,
  validate(UpdateRoomStatusSchema),
  asyncHandler(async (req, res) => {
    const room = await roomRepository.findById(req.params.id);

    if (!room) {
      throw NotFoundError('Room');
    }

    await checkPropertyOwnership(room.propertyId, req.user!.uid);

    const updated = await roomRepository.updateStatus(req.params.id, req.body.status);

    res.json({
      success: true,
      data: updated,
    });
  })
);

// DELETE /api/rooms/:id - Soft delete room
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const room = await roomRepository.findById(req.params.id);

    if (!room) {
      throw NotFoundError('Room');
    }

    await checkPropertyOwnership(room.propertyId, req.user!.uid);

    await roomRepository.deleteRoom(req.params.id);

    res.json({
      success: true,
      data: { id: req.params.id },
    });
  })
);

// GET /api/rooms/stats?propertyId=xxx - Get room statistics
router.get(
  '/stats/:propertyId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    await checkPropertyOwnership(req.params.propertyId, req.user!.uid);

    const stats = await roomRepository.getRoomStats(req.params.propertyId);
    const total = await roomRepository.countByProperty(req.params.propertyId);

    res.json({
      success: true,
      data: {
        total,
        ...stats,
      },
    });
  })
);

export default router;
