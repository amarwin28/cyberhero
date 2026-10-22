import React from 'react';
import { CheckCircle2, ArrowLeft, Shield } from 'lucide-react';

interface ThankYouPageProps {
  onNavigate: (view: string) => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-cyber-950 bg-grid-pattern flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Cyan Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-8 z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Glowing Checkmark Badge (Mockup Screen 7) */}
        <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto shadow-glow-cyan">
          <CheckCircle2 className="w-14 h-14" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-wide">
            Thank You!
          </h1>
          <p className="text-base sm:text-lg text-cyan-300 font-medium">
            Your answers have been recorded successfully.
          </p>
        </div>

        {/* College Card (Mockup Screen 7) */}
        <div className="cyber-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/30 shadow-cyber-card flex flex-col sm:flex-row items-center gap-5 text-left">
          <img
            src="/college-logo.jpeg"
            alt="Dhaanish Ahmed College Shield"
            className="w-16 h-16 object-contain rounded-xl bg-white p-1.5 shadow-md shrink-0"
          />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-wide">
              Dhaanish Ahmed College of Engineering
            </h3>
            <p className="text-xs text-cyan-400 font-semibold tracking-wider">
              CHENNAI • AUTONOMOUS • NAAC A+
            </p>
            <p className="text-xs text-slate-300 pt-1 leading-relaxed">
              Approved by AICTE, New Delhi &amp; Affiliated to Anna University. Department of Computer Science &amp;
              Engineering and Information Technology.
            </p>
          </div>
        </div>

        {/* Subtext */}
        <div className="space-y-1">
          <p className="text-sm text-slate-300">
            Thank you for participating in <strong className="text-cyan-400">CyberHero</strong>.
          </p>
          <p className="text-xs text-slate-400">
            Your answers are permanently finalized and recorded. Official results will be evaluated and announced
            by the college faculty.
          </p>
        </div>

        {/* Back to Home Button (Mockup Screen 7) */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate('landing')}
            className="cyber-btn-primary text-sm px-8 py-3.5 font-bold shadow-glow-cyan inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
