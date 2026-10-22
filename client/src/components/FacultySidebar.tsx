import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  Activity,
  Award,
  FileSpreadsheet,
  User,
  LogOut,
} from 'lucide-react';

interface FacultySidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExportExcel?: () => void;
}

export const FacultySidebar: React.FC<FacultySidebarProps> = ({
  currentTab,
  onSelectTab,
  onExportExcel,
}) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'question-bank', label: 'Question Bank', icon: FileQuestion },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'live-exam', label: 'Live Exam', icon: Activity },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'export-excel', label: 'Export Excel', icon: FileSpreadsheet, action: onExportExcel },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-cyber-900 border-r border-cyber-cyan/15 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      {/* Faculty Info Pill */}
      <div className="p-4 border-b border-cyber-cyan/15 flex items-center gap-3 bg-cyber-850/60">
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold">
          FC
        </div>
        <div className="overflow-hidden">
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Faculty Portal</p>
          <p className="text-sm font-bold text-white truncate">Dhaanish Chennai</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyber-blue text-white shadow-glow-blue'
                  : 'text-slate-300 hover:text-white hover:bg-cyber-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-cyber-cyan/15">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
