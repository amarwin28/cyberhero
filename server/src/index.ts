import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { AuthService } from './services/authService';
import { authRouter } from './routes/authRoutes';
import { studentRouter } from './routes/studentRoutes';
import { facultyRouter } from './routes/facultyRoutes';

export const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite development proxy compatibility
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Allowlist
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === config.appUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Global Rate Limiting: 500 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    application: 'CyberHero Examination System',
    organizer: 'Dhaanish Ahmed College of Engineering, Chennai',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/faculty', facultyRouter);

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]:', err);
  const status = err.status || 500;
  const message = config.nodeEnv === 'production' && status === 500
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
  });
});

// Start Server & Bootstrap
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, async () => {
    console.log(`================================================================`);
    console.log(`  CyberHero Backend Server is RUNNING on port ${config.port}`);
    console.log(`  Institution: Dhaanish Ahmed College of Engineering, Chennai`);
    console.log(`  Environment: ${config.nodeEnv} | DB: PostgreSQL 18 (5433)`);
    console.log(`================================================================`);

    // Auto-bootstrap faculty
    try {
      await AuthService.bootstrapFaculty();
    } catch (e: any) {
      console.error('[Faculty Bootstrap Warning]:', e.message);
    }
  });
}
