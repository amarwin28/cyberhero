import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// 11 Screens
import { LandingPage } from './pages/LandingPage';
import { LoginSelectionPage } from './pages/LoginSelectionPage';
import { StudentRegistrationPage } from './pages/StudentRegistrationPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { StudentExamPage } from './pages/StudentExamPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { FacultyLoginPage } from './pages/FacultyLoginPage';
import { FacultyDashboardPage } from './pages/FacultyDashboardPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { StudentDirectoryPage } from './pages/StudentDirectoryPage';

function AppContent() {
  const { user, role, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');

  // Handle URL hash navigation or deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentView(hash);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route protection
  useEffect(() => {
    if (!loading) {
      if (role === 'STUDENT' && (currentView === 'student-login' || currentView === 'login-selection')) {
        navigate('student-exam');
      } else if (role === 'FACULTY' && (currentView === 'faculty-login' || currentView === 'login-selection')) {
        navigate('faculty-dashboard');
      }
    }
  }, [role, loading, currentView]);

  // Don't show top navbar or footer inside the distraction-free exam interface
  const isExamView = currentView === 'student-exam';

  return (
    <div className="min-h-screen bg-cyber-950 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {!isExamView && <Navbar currentView={currentView} onNavigate={navigate} />}

      <div className="flex-1 flex flex-col">
        {currentView === 'landing' && <LandingPage onNavigate={navigate} />}
        {currentView === 'login-selection' && <LoginSelectionPage onNavigate={navigate} />}
        {currentView === 'student-register' && <StudentRegistrationPage onNavigate={navigate} />}
        {currentView === 'student-login' && <StudentLoginPage onNavigate={navigate} />}
        {currentView === 'student-exam' && <StudentExamPage onNavigate={navigate} />}
        {currentView === 'thank-you' && <ThankYouPage onNavigate={navigate} />}
        {currentView === 'faculty-login' && <FacultyLoginPage onNavigate={navigate} />}
        {currentView === 'faculty-dashboard' && <FacultyDashboardPage onNavigate={navigate} />}
        {currentView === 'question-bank' && <QuestionBankPage onNavigate={navigate} />}
        {currentView === 'student-directory' && <StudentDirectoryPage onNavigate={navigate} />}
      </div>

      {!isExamView && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
