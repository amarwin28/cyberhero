import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { StudentExamSession, StudentExamQuestion } from '../../../shared/types';
import {
  Clock,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Send,
  Loader2,
  Save,
} from 'lucide-react';

interface StudentExamPageProps {
  onNavigate: (view: string) => void;
}

export const StudentExamPage: React.FC<StudentExamPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<StudentExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | null>>({});
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Timer Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch or resume exam session
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/api/student/exam/session');
      if (res.success && res.data) {
        const sess: StudentExamSession = res.data;
        setSession(sess);
        setTimeLeft(sess.timeRemainingSeconds);

        // Prepopulate answers
        const initialAnswers: Record<string, string | null> = {};
        sess.questions.forEach((q) => {
          if (q.selectedOptionId) {
            initialAnswers[q.id] = q.selectedOptionId;
          }
        });
        setSelectedAnswers(initialAnswers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize exam session.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Countdown Timer
  useEffect(() => {
    if (loading || !session) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Automatic submission on timer expiry
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, session]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save selected option idempotently
  const handleOptionSelect = async (questionId: string, optionId: string) => {
    // Optimistic UI update
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    try {
      setSaving(true);
      await apiRequest('/api/student/exam/save-answer', {
        method: 'POST',
        body: JSON.stringify({ questionId, selectedOptionId: optionId }),
      });
    } catch (err: any) {
      console.error('Auto-save error:', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Final submission action
  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await apiRequest('/api/student/exam/submit', { method: 'POST' });
      if (res.success) {
        setShowSubmitModal(false);
        onNavigate('thank-you');
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white tracking-wide">Loading CyberHero Examination...</h2>
        <p className="text-xs text-slate-400 mt-1">Preparing your randomized question palette</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-cyber-950 flex flex-col items-center justify-center p-4">
        <div className="cyber-glass p-8 rounded-2xl max-w-md w-full border border-red-500/30 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Examination Session Notice</h2>
          <p className="text-sm text-slate-300">{error || 'Could not load exam session.'}</p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('landing')}
              className="cyber-btn-secondary text-xs px-6 py-2.5"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion: StudentExamQuestion | undefined = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const answeredCount = Object.values(selectedAnswers).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col">
      {/* --- TOP EXAM HEADER (Matching Screen 5 Mockup) --- */}
      <header className="bg-cyber-900 border-b border-cyber-cyan/20 px-4 lg:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Official College Banner Logo & Student Info */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img
              src="/dhaanish-banner.jpeg"
              alt="Dhaanish Ahmed College of Engineering"
              className="h-10 sm:h-12 w-auto object-contain rounded bg-white/5 p-1 border border-white/10"
            />
            <div className="text-xs text-slate-300 border-l border-slate-700 pl-3 space-y-0.5">
              <p className="font-bold text-white">
                Roll No: <span className="text-cyan-400 font-mono">{session.studentInfo.rollNumber}</span>
              </p>
              <p className="text-slate-300 truncate max-w-[200px]">
                Name: <span className="text-slate-100 font-medium">{session.studentInfo.fullName}</span>
              </p>
              <p className="text-slate-400 text-[11px] truncate max-w-[240px]">
                {session.studentInfo.schoolName} • {session.studentInfo.standard.replace('CLASS_', '')}th
              </p>
            </div>
          </div>

          {/* Center: Question Progress */}
          <div className="flex flex-col items-center w-full md:w-72 space-y-1.5">
            <div className="flex justify-between w-full text-xs font-semibold">
              <span className="text-slate-300">
                Question <span className="text-cyan-400 font-bold">{currentIndex + 1}</span> of {totalQuestions}
              </span>
              <span className="text-slate-400">{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-cyber-800 overflow-hidden border border-cyber-cyan/20">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 shadow-glow-cyan-sm"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Digital Countdown Timer */}
          <div className="flex items-center gap-3">
            <div className={`cyber-glass px-4 py-2 rounded-xl border flex items-center gap-2.5 font-mono text-base font-bold tracking-wider ${
              timeLeft < 300
                ? 'border-red-500 text-red-400 bg-red-950/40 animate-pulse'
                : 'border-cyan-400/40 text-cyan-400'
            }`}>
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-sans font-medium -mb-1">
                  Time Left
                </span>
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Auto-save status indicator */}
            <div className="hidden lg:flex items-center text-xs text-slate-400 gap-1.5">
              {saving ? (
                <>
                  <Save className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Saved</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN BODY: PALETTE SIDEBAR + EXAM QUESTION --- */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question Navigation Palette (Screen 5 Mockup) */}
        <aside className="lg:col-span-4 cyber-glass p-5 rounded-2xl border border-cyan-500/20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-cyan/15">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Question Palette
            </h3>
            <span className="text-xs text-cyan-400 font-mono font-medium">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          {/* 1..30 Numbered Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {session.questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = Boolean(selectedAnswers[q.id]);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-cyan-400 text-black shadow-glow-cyan scale-105 border-2 border-white'
                      : isAnswered
                      ? 'bg-cyber-blue text-white hover:bg-blue-600'
                      : 'bg-cyber-850 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:bg-cyber-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend (Matching Mockup: Current = Cyan, Answered = Deep Blue, Not Answered = Dark) */}
          <div className="pt-3 border-t border-cyber-cyan/15 space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-glow-cyan-sm" />
              <span className="text-slate-300">Current Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-cyber-blue" />
              <span className="text-slate-300">Answered</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-cyber-850 border border-slate-700" />
              <span className="text-slate-400">Not Answered</span>
            </div>
          </div>

          {/* Direct Submit Trigger */}
          <div className="pt-2">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full cyber-btn-secondary text-xs py-2.5 font-bold border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 inline-flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Finish &amp; Submit Exam</span>
            </button>
          </div>
        </aside>

        {/* Right: Question Card & 4 Selectable Options */}
        <main className="lg:col-span-8 flex flex-col space-y-6">
          {currentQuestion && (
            <div className="cyber-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/25 shadow-cyber-card flex-1 flex flex-col justify-between">
              <div>
                {/* Question Header */}
                <div className="flex items-center justify-between pb-4 border-b border-cyber-cyan/15 mb-6">
                  <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                    Question {currentIndex + 1}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-cyber-800 text-slate-300 font-mono">
                    {currentQuestion.marks} Mark
                  </span>
                </div>

                {/* Question Text */}
                <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-8">
                  {currentQuestion.questionText}
                </h2>

                {/* 4 Selectable Options (A, B, C, D) */}
                <div className="space-y-3.5">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const letter = letters[optIdx] || (optIdx + 1).toString();
                    const isSelected = selectedAnswers[currentQuestion.id] === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                        className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center gap-4 ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan-sm text-white'
                            : 'bg-cyber-850/80 border-slate-700/80 text-slate-200 hover:border-cyan-400/40 hover:bg-cyber-800'
                        }`}
                      >
                        {/* Letter Badge */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-cyan-400 text-black shadow-glow-cyan-sm'
                              : 'bg-cyber-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {letter}
                        </div>

                        {/* Option Text */}
                        <span className="text-sm sm:text-base font-medium flex-1">
                          {opt.optionText}
                        </span>

                        {/* Checkmark indicator */}
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Buttons (Mockup: Previous left, Next right) */}
              <div className="pt-8 mt-6 border-t border-cyber-cyan/15 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className={`cyber-btn-secondary text-sm px-6 py-2.5 inline-flex items-center gap-2 ${
                    currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="cyber-btn-primary text-sm px-8 py-2.5 font-bold inline-flex items-center gap-2 shadow-glow-cyan"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="cyber-btn-primary text-sm px-8 py-2.5 font-bold inline-flex items-center gap-2 shadow-glow-cyan bg-gradient-to-r from-emerald-500 to-cyan-500"
                  >
                    <span>Review &amp; Submit</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- SCREEN 6: SUBMISSION CONFIRMATION MODAL --- */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass p-8 rounded-3xl max-w-lg w-full border border-cyan-400/50 shadow-glow-cyan animate-in fade-in zoom-in-95 duration-200 text-center space-y-6">
            {/* Blue Circle with Question Mark (Mockup Screen 6) */}
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto shadow-glow-cyan">
              <HelpCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Confirm Submission
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Are you sure you want to submit your exam?
                <br />
                <span className="text-amber-400 font-semibold">
                  You will not be able to change your answers after submission.
                </span>
              </p>
            </div>

            {/* Answer Summary Stats */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-cyber-900 border border-cyan-500/20 text-left">
              <div>
                <span className="text-xs text-slate-400 block">Questions Answered</span>
                <span className="text-lg font-bold text-emerald-400">{answeredCount} of {totalQuestions}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Unanswered</span>
                <span className="text-lg font-bold text-amber-400">{unansweredCount}</span>
              </div>
            </div>

            {/* Action Buttons: Cancel and Confirm Submission (Screen 6 Mockup) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="cyber-btn-secondary flex-1 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="cyber-btn-primary flex-1 py-3 text-sm font-bold shadow-glow-cyan inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <span>Confirm Submission</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
