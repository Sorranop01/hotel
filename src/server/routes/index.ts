import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import roomRoutes from './room.routes';
import bookingRoutes from './booking.routes';
import accessCodeRoutes from './access-code.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/properties', propertyRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/access-codes', accessCodeRoutes);

export default router;
