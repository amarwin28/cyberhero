import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres@127.0.0.1:5433/cyberhero?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'cyberhero_jwt_super_secret_dhaanish_chennai_2026_key',
  sessionSecret: process.env.SESSION_SECRET || 'cyberhero_session_secret_dhaanish_chennai_2026_key',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  facultyEmail: process.env.FACULTY_EMAIL || 'dhaanishchennai@gmail.com',
  facultyPassword: process.env.FACULTY_PASSWORD || 'ChangeMe@123',
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'CyberHero Dhaanish <noreply@dhaanishchennai.edu.in>',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || '',
    apiKey: process.env.SMS_API_KEY || '',
  },
};
