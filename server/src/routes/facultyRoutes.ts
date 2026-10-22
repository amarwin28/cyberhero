import { Router, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { ExamService } from '../services/examService';
import { ExcelService } from '../services/excelService';
import { sseService } from '../services/sseService';
import { authenticate, requireFaculty, AuthenticatedRequest } from '../middleware/authMiddleware';

export const facultyRouter = Router();

// Enforce faculty authentication
facultyRouter.use(authenticate, requireFaculty);

/**
 * 1. Faculty Dashboard Statistics
 */
facultyRouter.get('/dashboard/stats', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await ExamService.getFacultyDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch dashboard stats.' });
  }
});

/**
 * 2. Live SSE Event Stream for Faculty Dashboard
 */
facultyRouter.get('/live-stream', (req: AuthenticatedRequest, res: Response) => {
  const clientId = crypto.randomUUID();
  sseService.addClient(clientId, res);
});

/**
 * 3. Active Exam Details
 */
facultyRouter.get('/exam/active', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const exam = await ExamService.getActiveExam();
    res.json({ success: true, data: exam });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch active exam.' });
  }
});

/**
 * 4. Lock Exam
 */
facultyRouter.post('/exam/lock', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.body;
    if (!examId) {
      res.status(400).json({ success: false, error: 'examId is required.' });
      return;
    }

    const lockedExam = await ExamService.lockExam(req.user!.userId, examId);
    res.json({
      success: true,
      message: 'Exam has been successfully locked and version snapshot created. Modifications are now prevented.',
      data: lockedExam,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to lock exam.' });
  }
});

/**
 * 5. Unlock Exam for Revision
 */
facultyRouter.post('/exam/unlock', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.body;
    if (!examId) {
      res.status(400).json({ success: false, error: 'examId is required.' });
      return;
    }

    const exam = await ExamService.unlockForRevision(req.user!.userId, examId);
    res.json({ success: true, message: 'Exam unlocked for drafting changes.', data: exam });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to unlock exam.' });
  }
});

/**
 * 6. Update Exam Settings
 */
facultyRouter.put('/exam/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId, durationMinutes, totalQuestions, passingMarks, allowedStandards, allowUnanswered } = req.body;
    if (!examId) {
      res.status(400).json({ success: false, error: 'examId is required.' });
      return;
    }

    const active = await prisma.exam.findUnique({ where: { id: examId } });
    if (!active) throw new Error('Exam not found.');
    if (active.isLocked) throw new Error('Cannot update settings of a LOCKED exam. Unlock or create a new revision.');

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: {
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        totalQuestions: totalQuestions ? parseInt(totalQuestions, 10) : undefined,
        passingMarks: passingMarks ? parseInt(passingMarks, 10) : undefined,
        allowedStandards: allowedStandards || undefined,
        allowUnanswered: allowUnanswered !== undefined ? Boolean(allowUnanswered) : undefined,
      },
    });

    res.json({ success: true, message: 'Exam settings updated successfully.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update exam settings.' });
  }
});

/**
 * 7. Questions List
 */
facultyRouter.get('/questions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const standard = req.query.standard as string | undefined;
    const questions = await ExamService.getQuestions(standard);
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch questions.' });
  }
});

/**
 * 8. Upsert Question (Add or Edit)
 */
facultyRouter.post('/questions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const question = await ExamService.upsertQuestion(req.body, req.user!.userId);
    res.json({ success: true, message: 'Question saved successfully.', data: question });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save question.' });
  }
});

/**
 * 9. Delete Question
 */
facultyRouter.delete('/questions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await ExamService.deleteQuestion(id, req.user!.userId);
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to delete question.' });
  }
});

/**
 * 10. Student Directory
 */
facultyRouter.get('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const standard = req.query.standard as string | undefined;
    const status = req.query.status as string | undefined;

    const directory = await ExamService.getStudentsDirectory(search, standard, status);
    res.json({ success: true, data: directory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch students directory.' });
  }
});

/**
 * 11. Export Students to Real .xlsx Excel Spreadsheet
 */
facultyRouter.get('/students/export-excel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const standard = req.query.standard as string | undefined;
    const status = req.query.status as string | undefined;

    const excelBuffer = await ExcelService.generateStudentExcel(search, standard, status);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `CyberHero_Student_Records_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to export Excel spreadsheet.' });
  }
});
