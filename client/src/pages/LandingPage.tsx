import React from 'react';
import {
  Shield,
  Trophy,
  Compass,
  UserCheck,
  ArrowRight,
  Lock,
  Clock,
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-950 bg-grid-pattern text-slate-100 relative overflow-hidden">
      {/* Decorative Cyber Neon Background Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[30rem] h-[30rem] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* --- HERO SECTION (Matching Approved Mockup Screen 1) --- */}
      <section className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-20 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Typography & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left z-10">
            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-white drop-shadow-[0_0_35px_rgba(0,210,255,0.4)]">
                CYBERHERO
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-200 tracking-wide">
                A Cyber Security Awareness &amp; Knowledge Challenge
              </p>
              <div className="inline-block mt-1">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  For Class 10 – 12 Students
                </span>
              </div>
            </div>

            {/* Feature Badges (Matching Mockup: LEARN, COMPETE, EXPLORE, BE A CYBERHERO) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="cyber-glass p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:scale-105">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider text-white">LEARN</span>
              </div>

              <div className="cyber-glass p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:scale-105">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider text-white">COMPETE</span>
              </div>

              <div className="cyber-glass p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:scale-105">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider text-white">EXPLORE</span>
              </div>

              <div className="cyber-glass p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:scale-105">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider text-white">BE A HERO</span>
              </div>
            </div>

            {/* Organizer Line */}
            <div className="pt-2">
              <p className="text-xs text-slate-400 font-medium">Organized by</p>
              <p className="text-sm sm:text-base font-bold text-white tracking-wide">
                Dhaanish Ahmed College of Engineering, Chennai
              </p>
              <p className="text-xs text-cyan-400 font-semibold">
                Autonomous | NAAC A+ | Approved by AICTE &amp; Affiliated to Anna University
              </p>
            </div>

            {/* Main CTA Button: Participate Now -> */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onNavigate('login-selection')}
                className="cyber-btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center gap-3 shadow-glow-cyan font-bold tracking-wide group"
              >
                <span>Participate Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('student-register')}
                className="cyber-btn-secondary text-base px-6 py-3.5 inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>New Registration</span>
              </button>
            </div>
          </div>

          {/* Right Column: Exact Hooded Cyber Hero Figure & Glow Pillars */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden border border-cyan-400/30 bg-cyber-900/60 shadow-2xl shadow-cyan-950/60 group">
              {/* Outer Cyan Ring Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-950 via-transparent to-transparent z-10" />

              {/* Exact Hooded Cyber Hero Image Asset */}
              <img
                src="/cyber-hero.png"
                alt="CyberHero Defense Shield"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
              />

              {/* Floating Shield Status Badge */}
              <div className="absolute bottom-4 left-4 right-4 z-20 cyber-glass p-3 rounded-xl border border-cyan-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">
                    Challenge Portal Active
                  </span>
                </div>
                <span className="text-xs text-cyan-300 font-mono">30 Questions • 45 Mins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about-section" className="py-16 bg-cyber-900/60 border-t border-cyber-cyan/15 relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">About the Cyber Security Challenge</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              CyberHero is specifically curated for school students in standards 10th, 11th, and 12th to test and
              nurture practical awareness against modern online threats, phishing scams, social engineering, and
              digital footprints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="cyber-glass p-6 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Realistic Threat Awareness</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test understanding of passwords, 2FA/MFA, ransomware, phishing scams, SIM swapping, and safe Wi-Fi
                hygiene.
              </p>
            </div>

            <div className="cyber-glass p-6 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Timed Adaptive Exam</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                45 minutes to solve 30 carefully crafted questions. Independent randomized question &amp; option order
                for each participant.
              </p>
            </div>

            <div className="cyber-glass p-6 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Official Recognition</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Participating students receive certificates of achievement from Dhaanish Ahmed College of
                Engineering, Chennai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- RULES SECTION --- */}
      <section id="rules-section" className="py-16 bg-cyber-950 border-t border-cyber-cyan/15">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Examination Guidelines &amp; Rules</h2>
            <p className="text-slate-400 text-sm">Review these instructions prior to beginning your exam session</p>
          </div>

          <div className="cyber-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200">
                <strong>Eligibility:</strong> Students enrolled in 10th, 11th, or 12th standard in any recognized
                school.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200">
                <strong>Roll Number:</strong> Each participant receives a unique 4-digit roll number (1000–9999) via
                SMS/Email OTP confirmation.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200">
                <strong>Single Attempt:</strong> Each student is permitted one exam attempt. Answers auto-save in
                real-time on selection.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200">
                <strong>Server Timer:</strong> The 45-minute countdown is enforced on the server. If time expires, the
                exam is finalized automatically.
              </p>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Refreshing or closing the browser will not erase your saved answers. You can resume your session within
                your allocated time window.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT & REGISTRATION BANNER --- */}
      <section id="contact-section" className="py-16 bg-gradient-to-b from-cyber-900 to-cyber-950 border-t border-cyber-cyan/15 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Test Your Cyber Defense Skills?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join hundreds of school participants competing in the CyberHero 2026 challenge.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onNavigate('student-register')}
              className="cyber-btn-primary px-8 py-3.5 text-base font-bold shadow-glow-cyan"
            >
              Register &amp; Get 4-Digit Roll Number
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
