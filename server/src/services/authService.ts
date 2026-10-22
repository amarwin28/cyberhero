import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { config } from '../config';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';

export interface TokenPayload {
  userId: string;
  role: 'STUDENT' | 'FACULTY';
  email?: string;
  rollNumber?: string;
  name: string;
  mustChangePassword?: boolean;
}

export class AuthService {
  /**
   * Bootstrap the faculty account safely on startup
   */
  static async bootstrapFaculty(): Promise<void> {
    const cleanEmail = config.facultyEmail.trim().toLowerCase();
    const existingFaculty = await prisma.faculty.findUnique({
      where: { email: cleanEmail },
    });

    if (!existingFaculty) {
      const passwordHash = await bcrypt.hash(config.facultyPassword, SALT_ROUNDS);
      await prisma.faculty.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: 'Dhaanish Chennai Faculty',
          mustChangePassword: true,
          role: 'FACULTY',
        },
      });
      console.log(`[BOOTSTRAP]: Initial Faculty account created for "${cleanEmail}" (password change required).`);
    } else if (existingFaculty.mustChangePassword) {
      // Ensure the initial configured bootstrap password matches DB if not yet changed
      const matches = await bcrypt.compare(config.facultyPassword, existingFaculty.passwordHash);
      if (!matches) {
        const passwordHash = await bcrypt.hash(config.facultyPassword, SALT_ROUNDS);
        await prisma.faculty.update({
          where: { id: existingFaculty.id },
          data: { passwordHash },
        });
        console.log(`[BOOTSTRAP]: Updated initial Faculty password hash to match configured environment.`);
      }
    }
  }

  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate signed JWT
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
  }

  /**
   * Verify JWT
   */
  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  }

  /**
   * Faculty Login
   */
  static async facultyLogin(email: string, pass: string): Promise<{ token: string; faculty: TokenPayload }> {
    const cleanEmail = email.trim().toLowerCase();
    const faculty = await prisma.faculty.findUnique({
      where: { email: cleanEmail },
    });

    if (!faculty) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(pass, faculty.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const payload: TokenPayload = {
      userId: faculty.id,
      role: 'FACULTY',
      email: faculty.email,
      name: faculty.name,
      mustChangePassword: faculty.mustChangePassword,
    };

    const token = this.generateToken(payload);

    await prisma.auditEvent.create({
      data: {
        actorType: 'FACULTY',
        actorId: faculty.id,
        action: 'FACULTY_LOGIN',
        details: JSON.stringify({ email: faculty.email }),
      },
    });

    return { token, faculty: payload };
  }

  /**
   * Faculty Password Change
   */
  static async changeFacultyPassword(
    facultyId: string,
    currentPass: string,
    newPass: string
  ): Promise<void> {
    if (newPass.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      throw new Error('Faculty account not found.');
    }

    const isCurrentValid = await bcrypt.compare(currentPass, faculty.passwordHash);
    if (!isCurrentValid) {
      throw new Error('Current password does not match.');
    }

    const newHash = await bcrypt.hash(newPass, SALT_ROUNDS);
    await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actorType: 'FACULTY',
        actorId: facultyId,
        action: 'FACULTY_PASSWORD_CHANGED',
        details: JSON.stringify({ email: faculty.email }),
      },
    });
  }

  /**
   * Student Login
   */
  static async studentLogin(
    rollNumber: string,
    pass: string
  ): Promise<{ token: string; student: TokenPayload; studentData: any }> {
    const cleanRoll = rollNumber.trim();
    const student = await prisma.student.findUnique({
      where: { rollNumber: cleanRoll },
    });

    if (!student) {
      throw new Error('Invalid Roll Number or Password.');
    }

    const isValid = await bcrypt.compare(pass, student.passwordHash);
    if (!isValid) {
      throw new Error('Invalid Roll Number or Password.');
    }

    const payload: TokenPayload = {
      userId: student.id,
      role: 'STUDENT',
      rollNumber: student.rollNumber,
      name: student.fullName,
      email: student.email,
    };

    const token = this.generateToken(payload);

    await prisma.auditEvent.create({
      data: {
        actorType: 'STUDENT',
        actorId: student.id,
        action: 'STUDENT_LOGIN',
        details: JSON.stringify({ rollNumber: student.rollNumber }),
      },
    });

    return {
      token,
      student: payload,
      studentData: {
        id: student.id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        schoolName: student.schoolName,
        standard: student.standard,
        status: student.status,
      },
    };
  }
}
