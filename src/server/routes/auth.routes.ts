import { Router } from 'express';
import { z } from 'zod';
import { userRepository } from '../repositories';
import { authMiddleware, validate, asyncHandler, NotFoundError } from '../middleware';
import { UpdateUserSchema } from '@shared/schemas';

const router = Router();

// Schema for registration (server-side, no confirmPassword needed)
const ServerRegisterSchema = z.object({
  uid: z.string().min(1, 'Firebase UID required'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  displayName: z.string().min(1, 'กรุณากรอกชื่อ'),
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรไม่ถูกต้อง').optional(),
});

// POST /api/auth/register - Register new user (after Firebase auth)
router.post(
  '/register',
  validate(ServerRegisterSchema),
  asyncHandler(async (req, res) => {
    const { uid, email, displayName, phoneNumber } = req.body;

    // Check if user already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'User already exists' },
      });
      return;
    }

    const user = await userRepository.createWithUid(uid, {
      email,
      displayName,
      phoneNumber,
      role: 'owner',
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  })
);

// GET /api/auth/me - Get current user
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await userRepository.findByFirebaseUid(req.user!.uid);

    if (!user) {
      throw NotFoundError('User');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  })
);

// PATCH /api/auth/me - Update current user profile
router.patch(
  '/me',
  authMiddleware,
  validate(UpdateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await userRepository.updateProfile(req.user!.uid, req.body);

    if (!user) {
      throw NotFoundError('User');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  })
);

export default router;
