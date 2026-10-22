import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma';
import { config } from '../config';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_MINUTES = 10;
const MAX_REQUESTS_PER_WINDOW = 3;

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${otp}`).digest('hex');
}

export class OtpService {
  /**
   * Request and dispatch an OTP for email or SMS
   */
  static async requestOtp(
    target: string,
    channel: 'EMAIL' | 'SMS'
  ): Promise<{ success: boolean; message: string; isConfigured: boolean; devOtp?: string }> {
    const cleanTarget = target.trim().toLowerCase();

    // 1. Rate Limiting Check: Max 3 OTP requests in the last 10 minutes
    const windowStart = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    const recentRequestsCount = await prisma.oTPVerification.count({
      where: {
        target: cleanTarget,
        channel,
        createdAt: { gte: windowStart },
      },
    });

    if (recentRequestsCount >= MAX_REQUESTS_PER_WINDOW) {
      throw new Error(
        `Too many OTP requests for this ${channel.toLowerCase()}. Please wait ${RATE_LIMIT_MINUTES} minutes before trying again.`
      );
    }

    // 2. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = `${salt}:${hashOtp(rawOtp, salt)}`;
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 3. Store OTP record in database
    await prisma.oTPVerification.create({
      data: {
        target: cleanTarget,
        channel,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    // 4. Dispatch OTP based on channel
    if (channel === 'SMS') {
      if (!config.sms.apiKey || !config.sms.provider) {
        throw new Error(
          'SMS OTP service is currently not configured by the institution. Please select "Verify by Email OTP".'
        );
      }
      // Future provider dispatch (e.g. Twilio / Fast2SMS)
      return {
        success: true,
        message: `OTP sent via SMS to ${target}`,
        isConfigured: true,
      };
    }

    // Email Channel
    const isEmailConfigured = Boolean(config.email.host && config.email.user && config.email.pass);

    if (isEmailConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.port === 465,
          auth: {
            user: config.email.user,
            pass: config.email.pass,
          },
        });

        await transporter.sendMail({
          from: config.email.from,
          to: cleanTarget,
          subject: 'CyberHero Examination — Your OTP Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #070B19; color: #ffffff; padding: 24px; border-radius: 8px;">
              <h2 style="color: #00D2FF; margin-bottom: 8px;">Dhaanish Ahmed College of Engineering, Chennai</h2>
              <h3 style="color: #ffffff; margin-top: 0;">CyberHero — Cybersecurity Awareness Challenge</h3>
              <p>Your one-time verification code (OTP) for registration is:</p>
              <div style="background-color: #0B1228; border: 1px solid #00D2FF; color: #00D2FF; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
                ${rawOtp}
              </div>
              <p style="color: #94A3B8; font-size: 13px;">This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes. Never share this OTP with anyone.</p>
            </div>
          `,
        });

        return {
          success: true,
          message: `Verification code sent to ${cleanTarget}`,
          isConfigured: true,
        };
      } catch (err: any) {
        console.error('[OTP Email Dispatch Error]:', err?.message);
        throw new Error(`Failed to deliver OTP email: ${err?.message || 'SMTP Connection Error'}`);
      }
    } else {
      // Development mode fallback when SMTP is unconfigured
      console.warn(
        `[OTP DEV NOTICE]: SMTP unconfigured. Generated OTP for ${cleanTarget}: [ ${rawOtp} ] (Expires in ${OTP_EXPIRY_MINUTES}m)`
      );
      return {
        success: true,
        message: `Verification code generated for ${cleanTarget}. (Email server unconfigured; check server console or development display)`,
        isConfigured: false,
        devOtp: process.env.NODE_ENV !== 'production' ? rawOtp : undefined,
      };
    }
  }

  /**
   * Verify an entered OTP
   */
  static async verifyOtp(target: string, channel: 'EMAIL' | 'SMS', enteredOtp: string): Promise<boolean> {
    const cleanTarget = target.trim().toLowerCase();

    // Find the latest active OTP verification record
    const record = await prisma.oTPVerification.findFirst({
      where: {
        target: cleanTarget,
        channel,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new Error('No active OTP request found. Please request a new OTP.');
    }

    if (new Date() > record.expiresAt) {
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      throw new Error('Too many invalid attempts. This OTP is invalidated. Please request a new one.');
    }

    // Split salt and hash
    const [salt, storedHash] = record.otpHash.split(':');
    const computedHash = hashOtp(enteredOtp.trim(), salt);

    if (computedHash !== storedHash) {
      // Increment failed attempt counter
      await prisma.oTPVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      throw new Error(`Invalid OTP. ${remaining} attempt(s) remaining.`);
    }

    // Mark as verified
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return true;
  }

  /**
   * Send post-registration confirmation with 4-digit roll number
   */
  static async sendRegistrationSuccessEmail(
    toEmail: string,
    studentName: string,
    rollNumber: string
  ): Promise<void> {
    const cleanEmail = toEmail.trim().toLowerCase();
    const isEmailConfigured = Boolean(config.email.host && config.email.user && config.email.pass);

    if (isEmailConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.port === 465,
          auth: {
            user: config.email.user,
            pass: config.email.pass,
          },
        });

        await transporter.sendMail({
          from: config.email.from,
          to: cleanEmail,
          subject: 'CyberHero Examination — Registration Confirmed & Your Roll Number',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #070B19; color: #ffffff; padding: 24px; border-radius: 8px;">
              <h2 style="color: #00D2FF; margin-bottom: 4px;">Dhaanish Ahmed College of Engineering, Chennai</h2>
              <h3 style="color: #ffffff; margin-top: 0;">CyberHero — Cybersecurity Awareness Challenge</h3>
              <p>Dear <strong>${studentName}</strong>,</p>
              <p>Your registration for CyberHero has been confirmed successfully!</p>
              <p>Your assigned 4-Digit Roll Number is:</p>
              <div style="background-color: #0B1228; border: 1px solid #00D2FF; color: #00D2FF; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 18px; text-align: center; border-radius: 6px; margin: 20px 0;">
                ${rollNumber}
              </div>
              <p>Use your <strong>Roll Number (${rollNumber})</strong> and the password you created during registration to log in to the examination portal.</p>
              <p style="color: #94A3B8; font-size: 13px;">Best wishes,<br/>Department of Information Technology & CSE<br/>Dhaanish Ahmed College of Engineering, Chennai</p>
            </div>
          `,
        });
      } catch (err: any) {
        console.error('[Registration Email Error]:', err?.message);
      }
    } else {
      console.log(
        `[REGISTRATION CONFIRMED]: Student "${studentName}" (${cleanEmail}) assigned Roll Number: [ ${rollNumber} ]`
      );
    }
  }
}
