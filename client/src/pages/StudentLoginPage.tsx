import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Hash, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

interface StudentLoginPageProps {
  onNavigate: (view: string) => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate }) => {
  const { loginStudent } = useAuth();
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rollNumber || rollNumber.trim().length !== 4) {
      setError('Please enter your valid 4-digit roll number (e.g., 1001).');
      return;
    }

    try {
      setLoading(true);
      await loginStudent(rollNumber.trim(), password);
      onNavigate('student-exam');
    } catch (err: any) {
      setError(err.message || 'Invalid Roll Number or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-cyber-950 bg-grid-pattern flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Header (Mockup Screen 4) */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mx-auto shadow-glow-cyan-sm">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Student Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your credentials to start the exam
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 flex items-start gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form Container */}
        <div className="cyber-glass p-8 rounded-2xl border border-cyan-500/20 shadow-cyber-card">
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Roll Number <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="studentRollNumber"
                  name="studentRollNumber"
                  autoComplete="off"
                  required
                  maxLength={4}
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4 digit roll number"
                  className="cyber-input cyber-input-with-icon w-full pl-11 text-sm tracking-wider font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="studentExamPassword"
                  name="studentExamPassword"
                  autoComplete="new-password"
                  data-lpignore="true"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="cyber-input cyber-input-with-icon cyber-input-with-action w-full pl-11 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-btn-primary text-sm py-3 font-bold tracking-wide shadow-glow-cyan flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Student Link (Mockup Screen 4) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            New Student?{' '}
            <button
              type="button"
              onClick={() => onNavigate('student-register')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Register Here
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => onNavigate('login-selection')}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Back to Selection
          </button>
        </div>
      </div>
    </div>
  );
};
