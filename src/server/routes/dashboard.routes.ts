import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { propertyRepository, roomRepository, bookingRepository } from '../repositories';
import type { Room } from '@shared/schemas';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.uid;

    // Get user's properties
    const properties = await propertyRepository.findByOwner(userId);
    const propertyIds = properties.map((p: { id: string }) => p.id);

    // Get rooms across all properties
    let totalRooms = 0;
    let availableRooms = 0;
    let occupiedRooms = 0;
    let cleaningRooms = 0;

    for (const propertyId of propertyIds) {
      const rooms = await roomRepository.findByProperty(propertyId);
      totalRooms += rooms.length;
      availableRooms += rooms.filter((r: Room) => r.status === 'available').length;
      occupiedRooms += rooms.filter((r: Room) => r.status === 'occupied').length;
      cleaningRooms += rooms.filter((r: Room) => r.status === 'cleaning').length;
    }

    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayCheckIns = 0;
    let todayCheckOuts = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    // Get first day of current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (const propertyId of propertyIds) {
      const bookings = await bookingRepository.findByProperty(propertyId);

      for (const booking of bookings) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);

        // Check if check-in is today
        if (
          checkInDate >= today &&
          checkInDate < tomorrow &&
          ['confirmed', 'pending'].includes(booking.status)
        ) {
          todayCheckIns++;
        }

        // Check if check-out is today
        if (
          checkOutDate >= today &&
          checkOutDate < tomorrow &&
          booking.status === 'checked_in'
        ) {
          todayCheckOuts++;
        }

        // Calculate today's revenue (from check-ins today)
        if (
          checkInDate >= today &&
          checkInDate < tomorrow &&
          booking.paymentStatus === 'paid'
        ) {
          todayRevenue += booking.totalPrice;
        }

        // Calculate month's revenue
        if (
          checkInDate >= firstDayOfMonth &&
          checkInDate < tomorrow &&
          booking.paymentStatus === 'paid'
        ) {
          monthRevenue += booking.totalPrice;
        }
      }
    }

    res.json({
      success: true,
      data: {
        properties: properties.length,
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          cleaning: cleaningRooms,
        },
        bookings: {
          today: todayCheckIns + todayCheckOuts,
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
        },
        revenue: {
          today: todayRevenue,
          month: monthRevenue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/today-bookings
router.get('/today-bookings', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.uid;

    // Get user's properties
    const properties = await propertyRepository.findByOwner(userId);
    const propertyIds = properties.map((p: { id: string }) => p.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    interface TodayBooking {
      id: string;
      bookingNumber: string;
      guestName: string;
      roomNumber: string;
      checkInDate: string;
      checkOutDate: string;
      status: string;
      type: 'checkin' | 'checkout';
    }

    const todayBookings: TodayBooking[] = [];

    for (const propertyId of propertyIds) {
      const bookings = await bookingRepository.findByProperty(propertyId);

      for (const booking of bookings) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);

        // Get room number
        const room = await roomRepository.findById(booking.roomId);
        const roomNumber = room?.roomNumber || 'N/A';

        // Check-ins today
        if (
          checkInDate >= today &&
          checkInDate < tomorrow &&
          ['confirmed', 'pending'].includes(booking.status)
        ) {
          todayBookings.push({
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            roomNumber,
            checkInDate: booking.checkIn.toISOString(),
            checkOutDate: booking.checkOut.toISOString(),
            status: booking.status,
            type: 'checkin',
          });
        }

        // Check-outs today
        if (
          checkOutDate >= today &&
          checkOutDate < tomorrow &&
          booking.status === 'checked_in'
        ) {
          todayBookings.push({
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            roomNumber,
            checkInDate: booking.checkIn.toISOString(),
            checkOutDate: booking.checkOut.toISOString(),
            status: booking.status,
            type: 'checkout',
          });
        }
      }
    }

    // Sort by type (check-ins first) then by room number
    todayBookings.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'checkin' ? -1 : 1;
      }
      return a.roomNumber.localeCompare(b.roomNumber);
    });

    res.json({
      success: true,
      data: todayBookings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
