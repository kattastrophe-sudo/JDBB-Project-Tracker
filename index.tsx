import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, AuthProvider, DataProvider, useAuth } from './data';
import { ROLES, isSupabaseConfigured } from './config';
import { Navbar, Sidebar } from './layout';

// View Imports
import { LoginScreen, SetupScreen } from './views/auth';
import { AdminDashboard, AdminSettings, RosterManager, SemesterManager } from './views/admin';
import { StudentDashboard, StudentProfile } from './views/student';
import { ProjectManager, ProjectDetail, ScheduleManager, ProgressMatrix } from './views/project';

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
    if (user.role === ROLES.STUDENT) {
      if (['semesters', 'matrix', 'roster', 'settings'].includes(currentView)) {
        return <StudentDashboard onSelectProject={handleSelectProject} setView={setCurrentView} />;
      }
    }

    switch(currentView) {
      case 'dashboard': return user.role === ROLES.STUDENT ? <StudentDashboard onSelectProject={handleSelectProject} setView={setCurrentView} /> : <AdminDashboard />;
      case 'semesters': return <SemesterManager />;
      case 'projects': return <ProjectManager onSelectProject={handleSelectProject} />;
      case 'project_detail': return <ProjectDetail projectId={selectedProjectId} targetStudentId={selectedStudentId} onBack={() => selectedStudentId ? setCurrentView('student_profile') : setCurrentView('projects')} />;
      case 'student_profile': return <StudentProfile studentId={selectedStudentId} onBack={() => setCurrentView('roster')} onSelectProject={handleInstructorSelectProject} />;
      case 'schedule': return <ScheduleManager />;
      case 'matrix': return <ProgressMatrix onSelectStudent={handleSelectStudent} />;
      case 'roster': return <RosterManager onSelectStudent={handleSelectStudent} />;
      case 'settings': return <AdminSettings />;
      default: return user.role === ROLES.STUDENT ? <StudentDashboard onSelectProject={handleSelectProject} setView={setCurrentView} /> : <AdminDashboard />;
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

const Root = () => {
  return isSupabaseConfigured ? <App /> : <SetupScreen />;
};

const root = createRoot(document.getElementById('root'));
root.render(<Root />);