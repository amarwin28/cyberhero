import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import { FacultySidebar } from '../components/FacultySidebar';
import {
  Plus,
  Lock,
  Unlock,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Loader2,
} from 'lucide-react';

interface QuestionBankPageProps {
  onNavigate: (view: string) => void;
}

interface QuestionItem {
  id: string;
  questionText: string;
  marks: number;
  standardEligibility: string;
  options: Array<{
    id: string;
    optionText: string;
    isCorrect: boolean;
    sortOrder: number;
  }>;
}

export const QuestionBankPage: React.FC<QuestionBankPageProps> = ({ onNavigate }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State for Add / Edit Question
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1);
  const [standardEligibility, setStandardEligibility] = useState('ALL');
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);

  // Lock Exam Modal State
  const [showLockModal, setShowLockModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [qRes, exRes] = await Promise.all([
        apiRequest(`/api/faculty/questions?standard=${selectedStandard}`),
        apiRequest('/api/faculty/exam/active'),
      ]);

      if (qRes.success) setQuestions(qRes.data || []);
      if (exRes.success) setExam(exRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch question bank.');
    } finally {
      setLoading(false);
    }
  }, [selectedStandard]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal for creating new question
  const handleOpenAdd = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setMarks(1);
    setStandardEligibility('ALL');
    setOptions([
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ]);
    setIsModalOpen(true);
  };

  // Open modal for editing existing question
  const handleOpenEdit = (q: QuestionItem) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.questionText);
    setMarks(q.marks);
    setStandardEligibility(q.standardEligibility);
    setOptions(
      q.options.map((o) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      }))
    );
    setIsModalOpen(true);
  };

  // Save question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    if (options.some((o) => !o.optionText.trim())) {
      setError('All 4 options must be non-empty.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiRequest('/api/faculty/questions', {
        method: 'POST',
        body: JSON.stringify({
          id: editingQuestionId || undefined,
          questionText: questionText.trim(),
          marks,
          standardEligibility,
          options,
        }),
      });

      if (res.success) {
        setIsModalOpen(false);
        setSuccessMsg('Question saved successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save question.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await apiRequest(`/api/faculty/questions/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete question.');
    }
  };

  // Lock Exam
  const handleLockExam = async () => {
    if (!exam?.id) return;
    try {
      setActionLoading(true);
      const res = await apiRequest('/api/faculty/exam/lock', {
        method: 'POST',
        body: JSON.stringify({ examId: exam.id }),
      });
      if (res.success) {
        setShowLockModal(false);
        setSuccessMsg('Exam successfully locked. Immutable version snapshot published.');
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to lock exam.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter questions by search
  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-cyber-950 text-slate-100">
      {/* Sidebar */}
      <FacultySidebar
        currentTab="question-bank"
        onSelectTab={(tab) => {
          if (tab === 'dashboard') onNavigate('faculty-dashboard');
          else if (tab === 'students' || tab === 'results') onNavigate('student-directory');
        }}
      />

      {/* Main Content (Mockup Screen 10) */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Question Bank
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, manage and edit exam questions • Total: {questions.length} questions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Lock / Locked Status Button */}
            {exam?.isLocked ? (
              <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold inline-flex items-center gap-2 shadow-sm">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Exam Locked (v{exam.activeVersion})</span>
              </div>
            ) : (
              <button
                onClick={() => setShowLockModal(true)}
                className="cyber-btn-secondary text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/15"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Exam</span>
              </button>
            )}

            {/* + Add Question Button */}
            <button
              disabled={exam?.isLocked}
              onClick={handleOpenAdd}
              className={`cyber-btn-primary text-xs px-5 py-2 font-bold inline-flex items-center gap-1.5 shadow-glow-cyan ${
                exam?.isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Locked Notice Banner */}
        {exam?.isLocked && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Notice:</strong> This examination version is currently <strong>LOCKED</strong>. Question modification, deletion, and addition are strictly frozen to preserve candidate integrity.
              </span>
            </div>
            <button
              onClick={async () => {
                await apiRequest('/api/faculty/exam/unlock', {
                  method: 'POST',
                  body: JSON.stringify({ examId: exam.id }),
                });
                fetchData();
              }}
              className="text-[11px] underline text-amber-400 hover:text-white shrink-0 ml-4 font-bold"
            >
              Unlock Revision
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls (Mockup Screen 10) */}
        <div className="cyber-glass p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search questions..."
              className="cyber-input w-full pl-10 text-xs py-2"
            />
          </div>

          {/* Standard Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedStandard}
              onChange={(e) => {
                setSelectedStandard(e.target.value);
                setCurrentPage(1);
              }}
              className="cyber-input text-xs py-2 appearance-none cursor-pointer w-full sm:w-44"
            >
              <option value="ALL" className="bg-cyber-900 text-white">All Standards</option>
              <option value="CLASS_10" className="bg-cyber-900 text-white">10th Standard</option>
              <option value="CLASS_11" className="bg-cyber-900 text-white">11th Standard</option>
              <option value="CLASS_12" className="bg-cyber-900 text-white">12th Standard</option>
            </select>
          </div>
        </div>

        {/* Questions Table (Mockup Screen 10) */}
        <div className="cyber-glass rounded-2xl border border-cyan-500/20 overflow-hidden shadow-cyber-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-slate-400 uppercase tracking-wider text-[11px] bg-cyber-900/80">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Question</th>
                  <th className="py-3.5 px-4 w-28">Standard</th>
                  <th className="py-3.5 px-4 w-24">Status</th>
                  <th className="py-3.5 px-4 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                      Loading question bank...
                    </td>
                  </tr>
                ) : paginatedQuestions.length > 0 ? (
                  paginatedQuestions.map((q, idx) => {
                    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                    const standardLabel =
                      q.standardEligibility === 'ALL'
                        ? '10-12'
                        : q.standardEligibility.replace('CLASS_', '') + 'th';

                    return (
                      <tr key={q.id} className="hover:bg-cyber-800/50 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                          {globalIdx}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white max-w-md">
                          <p className="line-clamp-2">{q.questionText}</p>
                          <div className="flex gap-2 text-[10px] text-cyan-300 mt-1">
                            {q.options.map((opt, oIdx) => (
                              <span
                                key={opt.id}
                                className={`px-1.5 py-0.5 rounded ${
                                  opt.isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                                    : 'text-slate-400'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}: {opt.optionText.slice(0, 18)}...
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">{standardLabel}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              disabled={exam?.isLocked}
                              onClick={() => handleOpenEdit(q)}
                              className="px-2.5 py-1 rounded bg-cyber-blue/80 hover:bg-cyber-blue text-white text-[11px] font-semibold transition-colors disabled:opacity-40"
                              title="Edit Question"
                            >
                              Edit
                            </button>
                            <button
                              disabled={exam?.isLocked}
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-[11px] font-semibold transition-colors disabled:opacity-40"
                              title="Delete Question"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No questions match your current search or standard filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (Mockup Screen 10) */}
          <div className="p-4 border-t border-cyber-cyan/15 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length}
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded border border-slate-700 flex items-center justify-center hover:bg-cyber-800 disabled:opacity-40"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-bold ${
                    currentPage === i + 1
                      ? 'bg-cyber-blue text-white shadow-glow-blue'
                      : 'border border-slate-700 hover:bg-cyber-800 text-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded border border-slate-700 flex items-center justify-center hover:bg-cyber-800 disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- ADD / EDIT QUESTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-cyan-400/50 shadow-glow-cyan max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-cyan/20">
              <h2 className="text-xl font-bold text-white">
                {editingQuestionId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Question Text <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type multiple choice question prompt here..."
                  className="cyber-input w-full text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Standard Eligibility
                  </label>
                  <select
                    value={standardEligibility}
                    onChange={(e) => setStandardEligibility(e.target.value)}
                    className="cyber-input w-full text-xs"
                  >
                    <option value="ALL">All (Class 10, 11, 12)</option>
                    <option value="CLASS_10">Class 10 Only</option>
                    <option value="CLASS_11">Class 11 Only</option>
                    <option value="CLASS_12">Class 12 Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value, 10) || 1)}
                    className="cyber-input w-full text-xs"
                  />
                </div>
              </div>

              {/* 4 Options designation */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Options (Exactly 4 Options — Select Radio for Correct Option) <span className="text-cyan-400">*</span>
                </label>

                {options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        opt.isCorrect
                          ? 'bg-cyan-500/10 border-cyan-400'
                          : 'bg-cyber-900 border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const updated = options.map((o, i) => ({
                            ...o,
                            isCorrect: i === idx,
                          }));
                          setOptions(updated);
                        }}
                        className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        title="Designate as correct option"
                      />
                      <span className="w-6 text-center font-bold font-mono text-cyan-400 text-xs">
                        {letters[idx]}
                      </span>
                      <input
                        type="text"
                        required
                        value={opt.optionText}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].optionText = e.target.value;
                          setOptions(updated);
                        }}
                        placeholder={`Option ${letters[idx]} text`}
                        className="cyber-input flex-1 text-xs py-1.5"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cyber-btn-secondary text-xs px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="cyber-btn-primary text-xs px-6 py-2.5 font-bold shadow-glow-cyan"
                >
                  {actionLoading ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LOCK EXAM CONFIRMATION MODAL --- */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass p-8 rounded-3xl max-w-md w-full border border-amber-400 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Lock Examination?</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Locking this exam freezes all {questions.length} questions and creates an immutable published version.
                <br />
                <span className="text-amber-400 font-semibold">
                  Once locked, questions, options and correct answers cannot be altered in place.
                </span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="cyber-btn-secondary flex-1 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleLockExam}
                className="cyber-btn-primary flex-1 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-md"
              >
                {actionLoading ? 'Publishing Version...' : 'Confirm Lock Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
