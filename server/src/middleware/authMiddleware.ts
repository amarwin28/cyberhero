import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.cyberhero_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : null);

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. No session token found.' });
    return;
  }

  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
    return;
  }
}

export function requireFaculty(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'FACULTY') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Faculty authorization required.',
    });
    return;
  }
  next();
}

export function requireStudent(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Student account required.',
    });
    return;
  }
  next();
}
