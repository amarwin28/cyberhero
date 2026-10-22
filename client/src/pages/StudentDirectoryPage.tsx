import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import { FacultySidebar } from '../components/FacultySidebar';
import { StudentDirectoryRecord } from '../../../shared/types';
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  MapPin,
  Mail,
  Phone,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';

interface StudentDirectoryPageProps {
  onNavigate: (view: string) => void;
}

export const StudentDirectoryPage: React.FC<StudentDirectoryPageProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<StudentDirectoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [exporting, setExporting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDirectoryRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedStandard !== 'ALL') params.append('standard', selectedStandard);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);

      const res = await apiRequest(`/api/faculty/students?${params.toString()}`);
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load students:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedStandard, selectedStatus]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDownloadExcel = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedStandard !== 'ALL') params.append('standard', selectedStandard);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);

      const blob = await apiRequest<Blob>(`/api/faculty/students/export-excel?${params.toString()}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberHero_Student_Records_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Excel export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(students.length / itemsPerPage));
  const paginatedStudents = students.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-cyber-950 text-slate-100">
      {/* Faculty Sidebar */}
      <FacultySidebar
        currentTab="students"
        onSelectTab={(tab) => {
          if (tab === 'dashboard') onNavigate('faculty-dashboard');
          else if (tab === 'question-bank') onNavigate('question-bank');
        }}
        onExportExcel={handleDownloadExcel}
      />

      {/* Main Content (Mockup Screen 11) */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header & Download Excel Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Students
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              View all registered students • {students.length} total participants
            </p>
          </div>

          <button
            disabled={exporting}
            onClick={handleDownloadExcel}
            className="cyber-btn-primary text-xs px-5 py-2.5 font-bold inline-flex items-center gap-2 shadow-glow-cyan"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating XLSX...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download Excel</span>
              </>
            )}
          </button>
        </div>

        {/* Filter Controls (Mockup Screen 11) */}
        <div className="cyber-glass p-4 rounded-xl border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, roll, school, or location..."
              className="cyber-input cyber-input-with-icon w-full pl-11 text-xs py-2"
            />
          </div>

          {/* Standard & Status Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Standard:</span>
              <select
                value={selectedStandard}
                onChange={(e) => {
                  setSelectedStandard(e.target.value);
                  setCurrentPage(1);
                }}
                className="cyber-input text-xs py-1.5 px-2 appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-cyber-900 text-white">All Standards</option>
                <option value="CLASS_10" className="bg-cyber-900 text-white">10th Standard</option>
                <option value="CLASS_11" className="bg-cyber-900 text-white">11th Standard</option>
                <option value="CLASS_12" className="bg-cyber-900 text-white">12th Standard</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="cyber-input text-xs py-1.5 px-2 appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-cyber-900 text-white">All Status</option>
                <option value="SUBMITTED" className="bg-cyber-900 text-white">Submitted</option>
                <option value="IN_PROGRESS" className="bg-cyber-900 text-white">In Progress</option>
                <option value="NOT_STARTED" className="bg-cyber-900 text-white">Not Started</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table (Mockup Screen 11) */}
        <div className="cyber-glass rounded-2xl border border-cyan-500/20 overflow-hidden shadow-cyber-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-slate-400 uppercase tracking-wider text-[11px] bg-cyber-900/80">
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">School</th>
                  <th className="py-3.5 px-4">Standard</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                      Loading student records...
                    </td>
                  </tr>
                ) : paginatedStudents.length > 0 ? (
                  paginatedStudents.map((s) => (
                    <tr
                      key={s.rollNumber}
                      onClick={() => setSelectedStudent(s)}
                      className="hover:bg-cyber-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{s.rollNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{s.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{s.school}</div>
                        {s.schoolLocation && (
                          <div className="text-[11px] text-cyan-400/80 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{s.schoolLocation}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{s.standard}</td>
                      <td className="py-3.5 px-4 text-slate-400">{s.city}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.status === 'SUBMITTED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : s.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {s.status === 'SUBMITTED' ? 'Submitted' : s.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {s.status === 'SUBMITTED' && s.score !== null ? (
                          <span className="text-emerald-400">{s.score}/{s.totalMarks || 30}</span>
                        ) : s.status === 'IN_PROGRESS' ? (
                          <span className="text-amber-400 text-[11px]">Provisional</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(s);
                          }}
                          className="p-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-700 text-slate-300 hover:text-white"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No student records found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Mockup Screen 11) */}
          <div className="p-4 border-t border-cyber-cyan/15 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, students.length)} of {students.length}
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

      {/* --- STUDENT FULL PROFILE MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-cyan-400/50 shadow-glow-cyan space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-cyan/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold font-mono">
                  {selectedStudent.rollNumber}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-cyan-400">{selectedStudent.standard} • {selectedStudent.school}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Email: <strong className="text-white">{selectedStudent.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Primary Mobile: <strong className="text-white">{selectedStudent.phone}</strong> (Alt: {selectedStudent.altPhone})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>City / Town: <strong className="text-white">{selectedStudent.city}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>School: <strong className="text-white">{selectedStudent.school}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>School Location: <strong className="text-white">{selectedStudent.schoolLocation || '-'}</strong></span>
              </div>
            </div>

            {/* Score & Examination Timestamps */}
            <div className="p-4 rounded-xl bg-cyber-900 border border-cyan-500/20 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Examination Record
              </span>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Participation Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedStudent.status === 'SUBMITTED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : selectedStudent.status === 'IN_PROGRESS'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {selectedStudent.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Official Score:</span>
                <span className="text-sm font-bold font-mono text-white">
                  {selectedStudent.score !== null ? `${selectedStudent.score} / ${selectedStudent.totalMarks || 30}` : 'Pending / Not Submitted'}
                </span>
              </div>

              {selectedStudent.submittedAt && (
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Finalized At:</span>
                  <span>{new Date(selectedStudent.submittedAt).toLocaleString('en-US')}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full cyber-btn-secondary py-2.5 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
