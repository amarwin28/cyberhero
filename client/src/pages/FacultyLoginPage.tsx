import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { UserCog, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface FacultyLoginPageProps {
  onNavigate: (view: string) => void;
}

export const FacultyLoginPage: React.FC<FacultyLoginPageProps> = ({ onNavigate }) => {
  const { loginFaculty } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forced Password Change State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeLoading, setChangeLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await loginFaculty(email.trim(), password);
      if (res.mustChangePassword) {
        setCurrentPassword(password);
        setShowChangePasswordModal(true);
      } else {
        onNavigate('faculty-dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('connect') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Cannot connect to the CyberHero server. Please ensure the backend is running.');
      } else if (msg.toLowerCase().includes('server error') || msg.toLowerCase().includes('500')) {
        setError('A server error occurred during authentication. Please try again later.');
      } else {
        setError(msg || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    if (newPassword.length < 8) {
      setChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangeError('New passwords do not match.');
      return;
    }

    try {
      setChangeLoading(true);
      const res = await apiRequest('/api/auth/faculty/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.success) {
        setShowChangePasswordModal(false);
        onNavigate('faculty-dashboard');
      }
    } catch (err: any) {
      setChangeError(err.message || 'Failed to update password.');
    } finally {
      setChangeLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-cyber-950 bg-grid-pattern flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Header (Mockup Screen 8) */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 mx-auto shadow-glow-blue">
            <UserCog className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Faculty Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Login to manage questions, students and results
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 flex items-start gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="cyber-glass p-8 rounded-2xl border border-cyan-500/20 shadow-cyber-card">
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="facultyEmail"
                  name="facultyEmail"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter faculty email address"
                  className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
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
                  id="facultyPassword"
                  name="facultyPassword"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your faculty password"
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
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Info Box */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Initial administrator account: <strong className="text-slate-300">dhaanishchennai@gmail.com</strong>
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

      {/* --- FORCED PASSWORD CHANGE MODAL ON FIRST LOGIN --- */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass p-8 rounded-3xl max-w-md w-full border border-cyan-400/50 shadow-glow-cyan space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white">First-Time Login Security</h2>
              <p className="text-xs text-slate-300">
                You are logging in with the default bootstrap password. Please set a new private password to continue.
              </p>
            </div>

            {changeError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                {changeError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="cyber-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="cyber-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="cyber-input w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={changeLoading}
                className="w-full cyber-btn-primary py-3 text-sm font-bold shadow-glow-cyan flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{changeLoading ? 'Updating Password...' : 'Save Password & Enter Dashboard'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
