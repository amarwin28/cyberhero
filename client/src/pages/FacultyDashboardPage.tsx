import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import { FacultySidebar } from '../components/FacultySidebar';
import { FacultyDashboardStats } from '../../../shared/types';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  PieChart,
  ArrowRight,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface FacultyDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const FacultyDashboardPage: React.FC<FacultyDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<FacultyDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/faculty/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Connect to Server-Sent Events for real-time live dashboard updates
    const eventSource = new EventSource('/api/faculty/live-stream');

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (['student_registered', 'exam_started', 'answer_saved', 'exam_submitted'].includes(payload.type)) {
          fetchStats(); // Auto-refresh metrics
        }
      } catch (e) {
        // Ignored
      }
    };

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchStats]);

  const handleExportExcel = async () => {
    try {
      const blob = await apiRequest<Blob>('/api/faculty/students/export-excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberHero_Student_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const total = stats?.totalStudents || 0;
  const submitted = stats?.submitted || 0;
  const inProgress = stats?.currentlyTaking || 0;
  const notStarted = stats?.notStarted || 0;

  const submittedPct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const notStartedPct = total > 0 ? Math.round((notStarted / total) * 100) : 0;

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-cyber-950 text-slate-100">
      {/* Faculty Sidebar (Mockup Screens 9, 10, 11) */}
      <FacultySidebar
        currentTab="dashboard"
        onSelectTab={(tab) => {
          if (tab === 'question-bank') onNavigate('question-bank');
          else if (tab === 'students' || tab === 'results') onNavigate('student-directory');
        }}
        onExportExcel={handleExportExcel}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* Title & Live Status Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Faculty Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dhaanish Ahmed College of Engineering, Chennai • Live Examination Monitoring
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live SSE Status Pill */}
            <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${
              sseConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${sseConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
              <span>{sseConnected ? 'Live Updates Active' : 'Connecting Stream...'}</span>
            </div>

            <button
              onClick={fetchStats}
              className="p-2 rounded-lg bg-cyber-850 hover:bg-cyber-800 text-slate-300 hover:text-white border border-cyber-cyan/20 transition-all"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* --- 4 STAT CARDS (Mockup Screen 9) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Students */}
          <div className="cyber-glass p-5 rounded-2xl border border-cyan-500/20 shadow-cyber-card flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Students
              </p>
              <h3 className="text-3xl font-black text-white mt-1">
                {total}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Currently Taking */}
          <div className="cyber-glass p-5 rounded-2xl border border-amber-500/20 shadow-cyber-card flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Currently Taking
              </p>
              <h3 className="text-3xl font-black text-amber-400 mt-1">
                {inProgress}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Submitted */}
          <div className="cyber-glass p-5 rounded-2xl border border-emerald-500/20 shadow-cyber-card flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Submitted
              </p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                {submitted}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Not Started */}
          <div className="cyber-glass p-5 rounded-2xl border border-slate-700 shadow-cyber-card flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Not Started
              </p>
              <h3 className="text-3xl font-black text-slate-300 mt-1">
                {notStarted}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- CHARTS ROW (Mockup Screen 9: Live Participation & Exam Status) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Participation Line/Area Chart */}
          <div className="lg:col-span-8 cyber-glass p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Participation
                </h3>
              </div>
              <span className="text-xs text-slate-400">Session Activity Over Time</span>
            </div>

            {/* Glowing SVG Curve Graph */}
            <div className="h-56 w-full pt-4 relative flex flex-col justify-end">
              <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0070F3" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#16234D" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#16234D" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#16234D" strokeDasharray="3 3" />

                {/* Area under curve */}
                <path
                  d="M 0,140 Q 60,110 120,90 T 240,60 T 360,40 T 500,20 L 500,150 L 0,150 Z"
                  fill="url(#cyberAreaGrad)"
                />

                {/* Glowing stroke curve */}
                <path
                  d="M 0,140 Q 60,110 120,90 T 240,60 T 360,40 T 500,20"
                  fill="none"
                  stroke="#00D2FF"
                  strokeWidth="3.5"
                  className="filter drop-shadow-[0_0_8px_#00D2FF]"
                />

                {/* Data Points */}
                <circle cx="120" cy="90" r="4" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="2" />
                <circle cx="240" cy="60" r="4" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="2" />
                <circle cx="360" cy="40" r="4" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="2" />
                <circle cx="500" cy="20" r="5" fill="#00D2FF" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* X-Axis Labels */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-800">
                <span>9:00 AM</span>
                <span>9:30 AM</span>
                <span>10:00 AM</span>
                <span>10:30 AM</span>
                <span>11:00 AM</span>
                <span>Now ({total})</span>
              </div>
            </div>
          </div>

          {/* Exam Status Donut Chart */}
          <div className="lg:col-span-4 cyber-glass p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Exam Status
              </h3>
            </div>

            {/* Circular Donut Display (Mockup Screen 9) */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16234D" strokeWidth="12" />
                {/* Submitted Ring (Green/Cyan) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#00D2FF"
                  strokeWidth="12"
                  strokeDasharray={`${submittedPct * 2.51} 251`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Stat */}
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">{submittedPct}%</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Submitted</span>
              </div>
            </div>

            {/* Legend Stats */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">Submitted</span>
                </div>
                <span className="font-bold text-white">{submitted}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-slate-300">In Progress</span>
                </div>
                <span className="font-bold text-white">{inProgress}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-600" />
                  <span className="text-slate-300">Not Started</span>
                </div>
                <span className="font-bold text-white">{notStarted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RECENT STUDENTS TABLE (Mockup Screen 9) --- */}
        <div className="cyber-glass rounded-2xl border border-cyan-500/20 overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-wide">
              Recent Students
            </h3>
            <button
              onClick={() => onNavigate('student-directory')}
              className="text-xs text-cyan-400 hover:text-white inline-flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">School</th>
                  <th className="py-3 px-3">Standard</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Submission Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {stats?.recentStudents && stats.recentStudents.length > 0 ? (
                  stats.recentStudents.map((st) => (
                    <tr key={st.rollNumber} className="hover:bg-cyber-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">{st.rollNumber}</td>
                      <td className="py-3 px-3 font-medium text-white">{st.name}</td>
                      <td className="py-3 px-3 text-slate-300">{st.school}</td>
                      <td className="py-3 px-3 text-slate-400">{st.standard}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            st.status === 'SUBMITTED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : st.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {st.status === 'SUBMITTED' ? 'Submitted' : st.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">{st.score}</td>
                      <td className="py-3 px-3 text-slate-400">{st.submissionTime || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
