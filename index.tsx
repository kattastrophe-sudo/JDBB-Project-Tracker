import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { User, Shield, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { ThemeProvider, AuthProvider, DataProvider, useAuth, ROLES, COLORS } from './data';
import { Navbar, Sidebar, Button } from './components';
import { StudentDashboard, AdminDashboard, SemesterManager, ProjectManager, ProjectDetail, StudentProfile, ScheduleManager, ProgressMatrix, RosterManager, AdminSettings } from './views';

// --- Login Screen ---

const LoginScreen = () => {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border-t-4 transition-colors" style={{ borderColor: COLORS.emerald }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">JDBB Project Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400">Select a role to enter the prototype.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Staff Access</p>
            <Button onClick={() => login(ROLES.ADMIN_TECH)} variant="secondary" fullWidth><Shield size={18} /> Admin Technologist</Button>
            <Button onClick={() => login(ROLES.ADMIN_INSTRUCTOR)} variant="secondary" fullWidth><Users size={18} /> Admin Instructor</Button>
            <Button onClick={() => login(ROLES.MONITOR)} variant="outline" fullWidth><CheckCircle size={18} /> Monitor</Button>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Student Access</p>
            <Button onClick={() => login(ROLES.STUDENT)} variant="primary" fullWidth><User size={18} /> Student Login</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Shell & Routing ---

const AppShell = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  if (!user) return <LoginScreen />;

  const handleSelectProject = (projectId) => { setSelectedProjectId(projectId); setCurrentView('project_detail'); };
  const handleSelectStudent = (studentId) => { setSelectedStudentId(studentId); setCurrentView('student_profile'); };
  const handleInstructorSelectProject = (projectId, studentId) => { setSelectedProjectId(projectId); setSelectedStudentId(studentId); setCurrentView('project_detail'); };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />;
      case 'semesters': return <SemesterManager />;
      case 'projects': return <ProjectManager onSelectProject={handleSelectProject} />;
      case 'project_detail': return <ProjectDetail projectId={selectedProjectId} targetStudentId={selectedStudentId} onBack={() => selectedStudentId ? setCurrentView('student_profile') : setCurrentView('projects')} />;
      case 'student_profile': return <StudentProfile studentId={selectedStudentId} onBack={() => setCurrentView('roster')} onSelectProject={handleInstructorSelectProject} />;
      case 'schedule': return <ScheduleManager />;
      case 'matrix': return <ProgressMatrix onSelectStudent={handleSelectStudent} />;
      case 'roster': return <RosterManager onSelectStudent={handleSelectStudent} />;
      case 'settings': return <AdminSettings />;
      default: return user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} close={() => setSidebarOpen(false)} currentView={currentView} setView={(view) => { setCurrentView(view); if (view !== 'project_detail' && view !== 'student_profile') { setSelectedProjectId(null); setSelectedStudentId(null); } }} />
      <main className="pt-16 lg:pl-64 min-h-screen transition-all duration-200">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{renderView()}</div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppShell />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
