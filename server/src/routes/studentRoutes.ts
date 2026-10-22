import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { ExamService } from '../services/examService';
import { authenticate, requireStudent, AuthenticatedRequest } from '../middleware/authMiddleware';

export const studentRouter = Router();

// Enforce student authentication across all student routes
studentRouter.use(authenticate, requireStudent);

/**
 * 1. Get or Resume Student Exam Session
 */
studentRouter.get('/exam/session', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await ExamService.getOrStartStudentSession(studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to retrieve exam session.' });
  }
});

/**
 * 2. Save Answer Idempotently
 */
studentRouter.post('/exam/save-answer', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { questionId, selectedOptionId } = req.body;

    if (!questionId) {
      res.status(400).json({ success: false, error: 'questionId is required.' });
      return;
    }

    const result = await ExamService.saveAnswer(studentId, questionId, selectedOptionId || null);
    res.json({ ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save answer.' });
  }
});

/**
 * 3. Finalize & Submit Exam
 */
studentRouter.post('/exam/submit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const attempt = await prisma.examAttempt.findUnique({
      where: { studentId },
    });

    if (!attempt) {
      res.status(400).json({ success: false, error: 'No active exam attempt found to submit.' });
      return;
    }

    const result = await ExamService.finalizeAttempt(attempt.id);

    // Note: Student response intentionally NEVER exposes score or answer keys
    res.json({
      success: true,
      message: 'Your exam answers have been recorded successfully.',
      data: {
        status: 'SUBMITTED',
        submittedAt: 'submittedAt' in result && result.submittedAt ? result.submittedAt : new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to submit exam.' });
  }
});
