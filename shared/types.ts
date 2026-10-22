export type StudentStandard = 'CLASS_10' | 'CLASS_11' | 'CLASS_12';

export type ExamStatus = 'DRAFT' | 'LOCKED' | 'OPEN' | 'CLOSED';

export type StudentExamStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED';

export interface StudentRegistrationInput {
  fullName: string;
  schoolName: string;
  standard: StudentStandard;
  studentAddress?: string;
  schoolLocation: string;
  schoolAddress?: string;
  city: string;
  email: string;
  phone: string;
  altPhone: string;
  password: string;
  verificationChannel: 'EMAIL' | 'SMS';
  otp: string;
}

export interface StudentLoginInput {
  rollNumber: string;
  password: string;
}

export interface FacultyLoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface OTPRequestInput {
  target: string; // email or phone
  channel: 'EMAIL' | 'SMS';
}

export interface OTPVerifyInput {
  target: string;
  channel: 'EMAIL' | 'SMS';
  otp: string;
}

// Student view of a question (NO answer key or isCorrect)
export interface StudentExamOption {
  id: string;
  optionText: string;
}

export interface StudentExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  marks: number;
  options: StudentExamOption[];
  selectedOptionId?: string | null;
}

export interface StudentExamSession {
  attemptId: string;
  examTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  startedAt: string;
  deadlineAt: string;
  timeRemainingSeconds: number;
  questions: StudentExamQuestion[];
  answeredCount: number;
  studentInfo: {
    rollNumber: string;
    fullName: string;
    schoolName: string;
    standard: StudentStandard;
  };
}

export interface SaveAnswerInput {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
}

export interface FinalizeExamInput {
  attemptId: string;
}

// Faculty question bank interfaces
export interface QuestionOptionInput {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

export interface UpsertQuestionInput {
  id?: string;
  examId?: string;
  questionText: string;
  marks: number;
  standardEligibility: StudentStandard | 'ALL';
  options: QuestionOptionInput[]; // exactly 4
}

export interface FacultyDashboardStats {
  totalStudents: number;
  currentlyTaking: number;
  submitted: number;
  notStarted: number;
  recentStudents: Array<{
    rollNumber: string;
    name: string;
    school: string;
    standard: string;
    status: StudentExamStatus;
    score: string; // e.g. "28/30" or "-"
    submissionTime: string | null;
  }>;
  participationTrend: Array<{
    timeLabel: string;
    count: number;
  }>;
}

export interface StudentDirectoryRecord {
  rollNumber: string;
  name: string;
  school: string;
  schoolLocation: string;
  standard: string;
  city: string;
  email: string;
  phone: string;
  altPhone: string;
  status: StudentExamStatus;
  score: number | null;
  totalMarks: number | null;
  startedAt: string | null;
  submittedAt: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
