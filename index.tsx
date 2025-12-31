import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { User, Shield, Users, CheckCircle, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { ThemeProvider, AuthProvider, DataProvider, useAuth, ROLES, COLORS } from './data';
import { Navbar, Sidebar, Button } from './components';
import { StudentDashboard, AdminDashboard, SemesterManager, ProjectManager, ProjectDetail, StudentProfile, ScheduleManager, ProgressMatrix, RosterManager, AdminSettings } from './views';

// --- Login Screen ---

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
          await login(email, password);
      } catch (err) {
          setError(err.message || "Failed to sign in");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border-t-4 transition-colors" style={{ borderColor: COLORS.emerald }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-white font-bold text-lg shadow-lg mb-4">JD</div>
          <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">JDBB Project Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400">Sign in to access your dashboard.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Email</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                    required
                    placeholder="user@jdbb.college.edu"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Password</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                    required
                    placeholder="••••••••"
                />
            </div>
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </Button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
            <p>New Student? Contact your instructor to be added to the roster.</p>
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
    // SECURITY GUARD: Strictly prevent Students from rendering Admin-only components
    // This ensures even if currentView state is manipulated, data is not shown.
    if (user.role === ROLES.STUDENT) {
      if (['semesters', 'matrix', 'roster', 'settings'].includes(currentView)) {
        return <StudentDashboard />;
      }
    }

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