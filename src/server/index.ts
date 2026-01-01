import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware';

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'staylock-api',
    version: '0.1.0',
  });
});

// API Routes
app.use('/api', routes);

// 404 handler for API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 StayLock API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`🏨 Properties: http://localhost:${PORT}/api/properties`);
  console.log(`🚪 Rooms: http://localhost:${PORT}/api/rooms`);
  console.log(`📅 Bookings: http://localhost:${PORT}/api/bookings`);
  console.log(`🔑 Access Codes: http://localhost:${PORT}/api/access-codes`);
});

export default app;
