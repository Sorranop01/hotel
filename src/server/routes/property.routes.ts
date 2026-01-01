import { Router } from 'express';
import { propertyRepository, roomRepository } from '../repositories';
import {
  authMiddleware,
  optionalAuthMiddleware,
  validate,
  asyncHandler,
  NotFoundError,
  ForbiddenError,
} from '../middleware';
import { CreatePropertySchema, UpdatePropertySchema } from '@shared/schemas';

const router = Router();

// GET /api/properties - Get all properties for current user
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const properties = await propertyRepository.findByOwner(req.user!.uid);

    // Add room stats for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        const roomStats = await roomRepository.getRoomStats(property.id);
        const availableRooms = roomStats.available || 0;
        const totalRooms = property.totalRooms || 0;
        const occupancyRate = totalRooms > 0
          ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100)
          : 0;

        return {
          ...property,
          availableRooms,
          occupancyRate,
        };
      })
    );

    res.json({
      success: true,
      data: propertiesWithStats,
    });
  })
);

// GET /api/properties/:id - Get property by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const property = await propertyRepository.findById(req.params.id);

    if (!property) {
      throw NotFoundError('Property');
    }

    // Check ownership
    if (property.ownerId !== req.user!.uid) {
      throw ForbiddenError('Not authorized to access this property');
    }

    const roomStats = await roomRepository.getRoomStats(property.id);

    res.json({
      success: true,
      data: {
        ...property,
        roomStats,
      },
    });
  })
);

// GET /api/properties/slug/:slug - Get property by slug (public)
router.get(
  '/slug/:slug',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const property = await propertyRepository.findBySlug(req.params.slug);

    if (!property) {
      throw NotFoundError('Property');
    }

    // Return limited data for public access
    res.json({
      success: true,
      data: {
        id: property.id,
        name: property.name,
        slug: property.slug,
        description: property.description,
        address: property.address,
        province: property.province,
        phoneNumber: property.phoneNumber,
        email: property.email,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
        images: property.images,
        amenities: property.amenities,
      },
    });
  })
);

// POST /api/properties - Create new property
router.post(
  '/',
  authMiddleware,
  validate(CreatePropertySchema),
  asyncHandler(async (req, res) => {
    const property = await propertyRepository.createForOwner(req.user!.uid, req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  })
);

// PATCH /api/properties/:id - Update property
router.patch(
  '/:id',
  authMiddleware,
  validate(UpdatePropertySchema),
  asyncHandler(async (req, res) => {
    const property = await propertyRepository.updateProperty(
      req.params.id,
      req.user!.uid,
      req.body
    );

    if (!property) {
      throw NotFoundError('Property');
    }

    res.json({
      success: true,
      data: property,
    });
  })
);

// DELETE /api/properties/:id - Soft delete property
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const property = await propertyRepository.findById(req.params.id);

    if (!property) {
      throw NotFoundError('Property');
    }

    if (property.ownerId !== req.user!.uid) {
      throw ForbiddenError('Not authorized to delete this property');
    }

    await propertyRepository.softDelete(req.params.id);

    res.json({
      success: true,
      data: { id: req.params.id },
    });
  })
);

export default router;
