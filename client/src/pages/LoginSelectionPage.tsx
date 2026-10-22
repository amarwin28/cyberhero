import React from 'react';
import { GraduationCap, UserCog, ArrowRight, Shield } from 'lucide-react';

interface LoginSelectionPageProps {
  onNavigate: (view: string) => void;
}

export const LoginSelectionPage: React.FC<LoginSelectionPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-cyber-950 bg-grid-pattern flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full text-center space-y-8 z-10">
        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" />
            CyberHero Access Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-white tracking-wider">
            CYBERHERO
          </h1>
          <p className="text-base text-slate-300 font-medium">Choose your login type to continue</p>
        </div>

        {/* The Two Login Option Cards (Screen 2 Mockup) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Card 1: Student Login */}
          <div
            onClick={() => onNavigate('student-login')}
            className="cyber-glass cyber-glass-hover p-8 rounded-2xl flex flex-col items-center text-center cursor-pointer group border border-cyan-500/20 hover:border-cyan-400 shadow-cyber-card"
          >
            <div className="w-20 h-20 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shadow-glow-cyan-sm">
              <GraduationCap className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              Student Login
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 flex-1">
              Register, attend the exam and be a part of CyberHero
            </p>

            <div className="w-12 h-12 rounded-full bg-cyber-blue text-white flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all shadow-glow-blue">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Faculty Login */}
          <div
            onClick={() => onNavigate('faculty-login')}
            className="cyber-glass cyber-glass-hover p-8 rounded-2xl flex flex-col items-center text-center cursor-pointer group border border-cyan-500/20 hover:border-cyan-400 shadow-cyber-card"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500/25 transition-all shadow-glow-blue">
              <UserCog className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              Faculty Login
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 flex-1">
              Create questions, manage students and view results
            </p>

            <div className="w-12 h-12 rounded-full bg-cyber-blue text-white flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all shadow-glow-blue">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
