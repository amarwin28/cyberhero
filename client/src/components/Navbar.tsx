import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  return (
    <header className="sticky top-0 z-50 bg-cyber-950/85 backdrop-blur-md border-b border-cyber-cyan/15 px-4 lg:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Official College Banner Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/dhaanish-banner.jpeg"
            alt="Dhaanish Ahmed College of Engineering, Chennai"
            className="h-10 sm:h-12 w-auto object-contain rounded bg-white/5 p-1 border border-white/10 group-hover:border-cyan-400/40 transition-colors"
          />
        </div>

        {/* Navigation Links for Public View */}
        {role === null && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-cyan-400 transition-colors ${
                currentView === 'landing' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => {
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('rules-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Rules
            </button>
            <button
              onClick={() => onNavigate('login-selection')}
              className={`hover:text-cyan-400 transition-colors ${
                currentView === 'login-selection' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Contact
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {role === null ? (
            <>
              <button
                onClick={() => onNavigate('login-selection')}
                className="hidden sm:inline-flex items-center text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-800/60 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('student-register')}
                className="cyber-btn-primary text-sm px-5 py-2 inline-flex items-center gap-2 shadow-glow-cyan-sm"
              >
                <Shield className="w-4 h-4 text-white" />
                Register Now
              </button>
            </>
          ) : role === 'STUDENT' ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs text-cyan-400 font-semibold tracking-wider">
                  STUDENT: {user?.rollNumber ? `ROLL #${user.rollNumber}` : ''}
                </span>
                <span className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
                  {user?.fullName || user?.name}
                </span>
              </div>
              <button
                onClick={() => onNavigate('student-exam')}
                className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 font-medium transition"
              >
                Go to Exam
              </button>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-800/60 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Faculty Portal</span>
                <span className="text-xs text-slate-300 font-medium">{user?.email}</span>
              </div>
              <button
                onClick={() => onNavigate('faculty-dashboard')}
                className="cyber-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-800/60 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
