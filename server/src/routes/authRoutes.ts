import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../prisma';
import { OtpService } from '../services/otpService';
import { RollNumberService } from '../services/rollNumberService';
import { AuthService } from '../services/authService';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { sseService } from '../services/sseService';

export const authRouter = Router();

// Login rate limiter: Max 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod validation schemas
const StudentRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  standard: z.enum(['CLASS_10', 'CLASS_11', 'CLASS_12']),
  studentAddress: z.string().optional(),
  schoolLocation: z.string().min(2, 'School location must be at least 2 characters').optional(),
  schoolAddress: z.string().min(2, 'School location must be at least 2 characters').optional(),
  city: z.string().min(2, 'City/Town must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Primary phone must be a 10-digit number'),
  altPhone: z.string().regex(/^[0-9]{10}$/, 'Alternative phone must be a 10-digit number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  verificationChannel: z.enum(['EMAIL', 'SMS']),
  otp: z.string().min(6, 'OTP must be 6 digits'),
}).refine((data) => Boolean(data.schoolLocation?.trim() || data.schoolAddress?.trim()), {
  message: 'School location is required and must be at least 2 characters',
  path: ['schoolLocation'],
});

/**
 * 1. Request OTP
 */
authRouter.post('/otp/request', async (req: Request, res: Response) => {
  try {
    const { target, channel } = req.body;
    if (!target || !channel) {
      res.status(400).json({ success: false, error: 'Target (email/phone) and channel (EMAIL/SMS) are required.' });
      return;
    }

    if (channel !== 'EMAIL' && channel !== 'SMS') {
      res.status(400).json({ success: false, error: 'Channel must be EMAIL or SMS.' });
      return;
    }

    const result = await OtpService.requestOtp(target, channel);
    res.json({ ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to request OTP.' });
  }
});

/**
 * 2. Verify OTP
 */
authRouter.post('/otp/verify', async (req: Request, res: Response) => {
  try {
    const { target, channel, otp } = req.body;
    if (!target || !channel || !otp) {
      res.status(400).json({ success: false, error: 'Target, channel, and OTP are required.' });
      return;
    }

    const verified = await OtpService.verifyOtp(target, channel, otp);
    res.json({ success: true, verified, message: 'OTP verified successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'OTP verification failed.' });
  }
});

/**
 * 3. Student Registration
 */
authRouter.post('/student/register', async (req: Request, res: Response) => {
  try {
    const validated = StudentRegisterSchema.parse(req.body);

    const cleanEmail = validated.email.trim().toLowerCase();

    // Check if email already registered
    const existing = await prisma.student.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: 'A student with this email address is already registered. Please log in with your roll number.',
      });
      return;
    }

    // Verify OTP was valid for this email/phone
    const verifyTarget = validated.verificationChannel === 'EMAIL' ? cleanEmail : validated.phone;
    const verifiedRecord = await prisma.oTPVerification.findFirst({
      where: {
        target: verifyTarget,
        channel: validated.verificationChannel,
        verified: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verifiedRecord) {
      res.status(400).json({
        success: false,
        error: 'Please verify your contact details with OTP before completing registration.',
      });
      return;
    }

    // Allocate Unique 4-Digit Roll Number (1000–9999)
    const rollNumber = await RollNumberService.allocateRollNumber();

    // Hash password
    const passwordHash = await AuthService.hashPassword(validated.password);

    const schoolLoc = (validated.schoolLocation || validated.schoolAddress || '').trim();

    // Save student to database
    const student = await prisma.student.create({
      data: {
        rollNumber,
        fullName: validated.fullName.trim(),
        schoolName: validated.schoolName.trim(),
        standard: validated.standard,
        studentAddress: validated.studentAddress?.trim() || null,
        schoolLocation: schoolLoc,
        city: validated.city.trim(),
        email: cleanEmail,
        phone: validated.phone.trim(),
        altPhone: validated.altPhone.trim(),
        passwordHash,
        status: 'NOT_STARTED',
      },
    });

    // Send confirmation email containing roll number
    OtpService.sendRegistrationSuccessEmail(cleanEmail, student.fullName, rollNumber).catch(() => {});

    // Generate JWT
    const token = AuthService.generateToken({
      userId: student.id,
      role: 'STUDENT',
      rollNumber: student.rollNumber,
      name: student.fullName,
      email: student.email,
    });

    // Set secure HTTP-only cookie
    res.cookie('cyberhero_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Notify faculty via SSE
    sseService.broadcast('student_registered', {
      rollNumber: student.rollNumber,
      name: student.fullName,
      school: student.schoolName,
      standard: student.standard,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your 4-digit roll number has been generated.',
      data: {
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        schoolName: student.schoolName,
        standard: student.standard,
        email: student.email,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation failed.' });
      return;
    }
    res.status(400).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

/**
 * 4. Student Login
 */
authRouter.post('/student/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { rollNumber, password } = req.body;
    if (!rollNumber || !password) {
      res.status(400).json({ success: false, error: 'Roll number and password are required.' });
      return;
    }

    const { token, student, studentData } = await AuthService.studentLogin(rollNumber, password);

    res.cookie('cyberhero_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        student,
        studentData,
      },
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid Roll Number or Password.' });
  }
});

/**
 * 5. Faculty Login
 */
authRouter.post('/faculty/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const { token, faculty } = await AuthService.facultyLogin(email, password);

    res.cookie('cyberhero_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Faculty login successful.',
      data: {
        token,
        faculty,
      },
    });
  } catch (err: any) {
    if (err.message === 'Invalid email or password.') {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
    } else {
      console.error('[Faculty Login Server Error]:', err);
      res.status(500).json({ success: false, error: 'A server error occurred during authentication. Please try again.' });
    }
  }
});

/**
 * 6. Faculty Forced Password Change
 */
authRouter.post('/faculty/change-password', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'FACULTY') {
      res.status(403).json({ success: false, error: 'Only faculty can change this password.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Current and new password are required.' });
      return;
    }

    await AuthService.changeFacultyPassword(req.user.userId, currentPassword, newPassword);

    res.json({ success: true, message: 'Password updated successfully. You can now access all faculty features.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update password.' });
  }
});

/**
 * 7. Get Current Session User
 */
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated.' });
      return;
    }

    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          rollNumber: true,
          fullName: true,
          schoolName: true,
          standard: true,
          city: true,
          email: true,
          status: true,
        },
      });
      res.json({ success: true, role: 'STUDENT', user: student });
      return;
    }

    if (req.user.role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          mustChangePassword: true,
          role: true,
        },
      });
      res.json({ success: true, role: 'FACULTY', user: faculty });
      return;
    }

    res.status(400).json({ success: false, error: 'Unknown user role.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve session user.' });
  }
});

/**
 * 8. Logout
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('cyberhero_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});
