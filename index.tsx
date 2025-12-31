import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { User, Shield, Users, Calendar, Layout, LogOut, Menu, CheckCircle, AlertCircle, Plus, MoreHorizontal, Clock, Tag, UserPlus, Trash2, Search, Sun, Moon, ArrowLeft, Camera, FileText, Send, Paperclip, BarChart3, Filter, X, Lock, Eye, Settings, Mail, Archive, Power, Download, Bell, Play, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';

// --- JDBB Design System & Constants ---

// Official Palette from Plan Appendix A
const COLORS = {
  limeCream: '#BCE784',   // Success, Review, Positive
  emerald: '#5DD39E',     // Primary Action, Active
  pacificCyan: '#348AA7', // Info, Timeline, Neutral
  dustyGrape: '#525174',  // Secondary, Admin Structure
  vintageGrape: '#513B56',// Alerts, Overdue, Emphasis
  white: '#FFFFFF',
  textMain: '#1E293B',    // Slate 800
  textLight: '#64748B',   // Slate 500
};

const ROLES = {
  ADMIN_TECH: 'Admin Technologist',
  ADMIN_INSTRUCTOR: 'Admin Instructor',
  MONITOR: 'Monitor',
  STUDENT: 'Student',
};

// --- Types (Plan Section 5) ---

interface Semester {
  id: string;
  name: string;
  courseCode: string;
  isActive: boolean;
  startDate: string;
}

interface Project {
  id: string;
  semesterId: string;
  code: string;
  title: string;
  isPublished: boolean;
  description?: string;
}

interface ScheduleItem {
  id: string;
  semesterId: string;
  projectId?: string; // Optional link to project
  title: string;
  date: string;
  type: 'assigned' | 'demo' | 'progress_check' | 'lab_day' | 'due' | 'critique';
}

interface Profile {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

interface Enrollment {
  id: string;
  profileId: string;
  semesterId: string;
  studentNumber: string;
  tagNumber: string;
  status: 'active' | 'dropped';
}

interface CheckIn {
  id: string;
  projectId: string;
  studentId: string; // Links to Profile ID for MVP simplicity
  date: string;
  type: 'progress' | 'submission' | 'question' | 'instructor_comment';
  content: string;
  imageMockUrl?: string; // Simulation of attachment
}

interface StudentProjectState {
  id: string;
  projectId: string;
  studentId: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed';
  lastActivity: string;
  instructorNotes?: string;
}

interface NotificationLog {
  id: string;
  date: string;
  recipient: string;
  type: 'Reminder' | 'Alert';
  subject: string;
  status: 'Sent' | 'Failed' | 'Queued';
}

// --- Theme Context ---

const ThemeContext = createContext({
  isDark: true, // Default to dark per request
  toggleTheme: () => {}
});

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- Mock Data Context ---

interface DataContextType {
  semesters: Semester[];
  projects: Project[];
  scheduleItems: ScheduleItem[];
  profiles: Profile[];
  enrollments: Enrollment[];
  checkIns: CheckIn[];
  projectStates: StudentProjectState[];
  notificationLogs: NotificationLog[];
  currentSemesterId: string;
  setCurrentSemesterId: (id: string) => void;
  addSemester: (sem: Omit<Semester, 'id'>) => void;
  toggleSemesterStatus: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  addStudentToSemester: (student: { name: string; email: string; studentNumber: string; tagNumber: string }, semesterId: string) => void;
  removeStudentFromSemester: (enrollmentId: string) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  updateProjectStatus: (projectId: string, studentId: string, status: StudentProjectState['status']) => void;
  updateInstructorNotes: (projectId: string, studentId: string, notes: string) => void;
  runDailyReminders: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const initialSemesters: Semester[] = [
  { id: 'sem-1', name: 'Winter 2026 – Modelmaking & Casting', courseCode: 'JJEW-100', isActive: true, startDate: '2026-01-08' },
  { id: 'sem-2', name: 'Fall 2025 – Fabrication 1', courseCode: 'JJEW-100', isActive: false, startDate: '2025-09-05' },
];

const initialProjects: Project[] = [
  { id: 'p-1', semesterId: 'sem-1', code: 'P1', title: 'Orthographic Rendering', isPublished: true, description: 'Create 3 views of a simple ring design using standard drafting techniques.' },
  { id: 'p-2', semesterId: 'sem-1', code: 'P2', title: 'Wax Carving Basics', isPublished: true, description: 'Carve a signet ring from green wax tube.' },
  { id: 'p-3', semesterId: 'sem-1', code: 'P3', title: 'Lost Wax Casting', isPublished: false },
];

const initialSchedule: ScheduleItem[] = [
  { id: 's-1', semesterId: 'sem-1', projectId: 'p-1', title: 'P1 Due Date', date: '2026-02-01', type: 'due' },
  { id: 's-2', semesterId: 'sem-1', projectId: 'p-2', title: 'P2 Demo Day', date: '2026-02-03', type: 'demo' },
  { id: 's-3', semesterId: 'sem-1', projectId: 'p-1', title: 'P1 Rough Draft Check', date: '2026-01-20', type: 'progress_check' },
];

const initialProfiles: Profile[] = [
  { id: 'u-1', email: 'alex@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Alex Student' },
  { id: 'u-2', email: 'sam@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Sam Jeweler' },
  { id: 'u-3', email: 'casey@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Casey Caster' },
  { id: 'u-4', email: 'jordan@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Jordan Gem' },
  { id: 'u-5', email: 'taylor@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Taylor Tool' },
];

const initialEnrollments: Enrollment[] = [
  { id: 'e-1', profileId: 'u-1', semesterId: 'sem-1', studentNumber: 'S1000001', tagNumber: '04', status: 'active' },
  { id: 'e-2', profileId: 'u-2', semesterId: 'sem-1', studentNumber: 'S1000002', tagNumber: '12', status: 'active' },
  { id: 'e-3', profileId: 'u-3', semesterId: 'sem-1', studentNumber: 'S1000003', tagNumber: '01', status: 'active' },
  { id: 'e-4', profileId: 'u-4', semesterId: 'sem-1', studentNumber: 'S1000004', tagNumber: '15', status: 'active' },
  { id: 'e-5', profileId: 'u-5', semesterId: 'sem-1', studentNumber: 'S1000005', tagNumber: '08', status: 'active' },
];

const initialCheckIns: CheckIn[] = [
  { id: 'c-1', projectId: 'p-1', studentId: 'u-1', date: '2026-01-18T10:00:00', type: 'progress', content: 'Started the top view, struggling with the shank thickness.' },
];

const initialProjectStates: StudentProjectState[] = [
  { id: 'ps-1', projectId: 'p-1', studentId: 'u-1', status: 'in_progress', lastActivity: '2026-01-18' },
  { id: 'ps-2', projectId: 'p-1', studentId: 'u-2', status: 'submitted', lastActivity: '2026-01-19' },
  { id: 'ps-3', projectId: 'p-1', studentId: 'u-3', status: 'reviewed', lastActivity: '2026-01-20' },
  { id: 'ps-4', projectId: 'p-1', studentId: 'u-4', status: 'not_started', lastActivity: '2026-01-15' },
  { id: 'ps-5', projectId: 'p-2', studentId: 'u-3', status: 'in_progress', lastActivity: '2026-01-21' },
];

const initialNotificationLogs: NotificationLog[] = [
  { id: 'n-1', date: '2026-01-30T08:00:00', recipient: 'alex@student.jdbb.edu', type: 'Reminder', subject: 'P1 Due in 2 days', status: 'Sent' },
  { id: 'n-2', date: '2026-01-30T08:00:00', recipient: 'sam@student.jdbb.edu', type: 'Reminder', subject: 'P1 Due in 2 days', status: 'Sent' },
  { id: 'n-3', date: '2026-01-28T08:00:00', recipient: 'jordan@student.jdbb.edu', type: 'Alert', subject: 'Missed Progress Check', status: 'Failed' },
];

const DataProvider = ({ children }: { children?: React.ReactNode }) => {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(initialSchedule);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(initialCheckIns);
  const [projectStates, setProjectStates] = useState<StudentProjectState[]>(initialProjectStates);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(initialNotificationLogs);
  const [currentSemesterId, setCurrentSemesterId] = useState<string>('sem-1');

  const addSemester = (sem: Omit<Semester, 'id'>) => {
    const newSem = { ...sem, id: `sem-${Date.now()}` };
    setSemesters([...semesters, newSem]);
  };

  const toggleSemesterStatus = (id: string) => {
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: `p-${Date.now()}` };
    setProjects([...projects, newProject]);
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem = { ...item, id: `s-${Date.now()}` };
    setScheduleItems([...scheduleItems, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const addStudentToSemester = (studentData: { name: string; email: string; studentNumber: string; tagNumber: string }, semesterId: string) => {
    const newProfileId = `u-${Date.now()}`;
    const newProfile: Profile = {
      id: newProfileId,
      fullName: studentData.name,
      email: studentData.email,
      role: ROLES.STUDENT
    };

    const newEnrollment: Enrollment = {
      id: `e-${Date.now()}`,
      profileId: newProfileId,
      semesterId: semesterId,
      studentNumber: studentData.studentNumber,
      tagNumber: studentData.tagNumber,
      status: 'active'
    };

    setProfiles([...profiles, newProfile]);
    setEnrollments([...enrollments, newEnrollment]);
  };

  const removeStudentFromSemester = (enrollmentId: string) => {
    setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
  };

  const addCheckIn = (checkIn: Omit<CheckIn, 'id'>) => {
    const newCheckIn = { ...checkIn, id: `c-${Date.now()}` };
    setCheckIns([newCheckIn, ...checkIns]);
    
    // Auto-update status to in_progress if not started (unless it's an instructor comment)
    if (checkIn.type !== 'instructor_comment') {
       updateProjectStatus(checkIn.projectId, checkIn.studentId, 'in_progress');
    }
  };

  const updateProjectStatus = (projectId: string, studentId: string, status: StudentProjectState['status']) => {
    setProjectStates(prev => {
      const existing = prev.find(p => p.projectId === projectId && p.studentId === studentId);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, status, lastActivity: new Date().toISOString() } : p);
      } else {
        return [...prev, {
          id: `ps-${Date.now()}`,
          projectId,
          studentId,
          status,
          lastActivity: new Date().toISOString()
        }];
      }
    });
  };

  const updateInstructorNotes = (projectId: string, studentId: string, notes: string) => {
    setProjectStates(prev => {
      const existing = prev.find(p => p.projectId === projectId && p.studentId === studentId);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, instructorNotes: notes } : p);
      } else {
        return [...prev, {
          id: `ps-${Date.now()}`,
          projectId,
          studentId,
          status: 'not_started',
          lastActivity: new Date().toISOString(),
          instructorNotes: notes
        }];
      }
    });
  };

  const runDailyReminders = () => {
    const now = new Date();
    const upcoming = scheduleItems.filter(item => {
      const d = new Date(item.date);
      const diff = d.getTime() - now.getTime();
      const days = diff / (1000 * 3600 * 24);
      return days >= 0 && days <= 7 && item.semesterId === currentSemesterId;
    });

    const newLogs: NotificationLog[] = [];
    const activeEnrollments = enrollments.filter(e => e.semesterId === currentSemesterId);

    activeEnrollments.forEach(enrollment => {
       const profile = profiles.find(p => p.id === enrollment.profileId);
       if (!profile) return;

       upcoming.forEach(item => {
          newLogs.push({
            id: `n-${Date.now()}-${Math.random()}`,
            date: new Date().toISOString(),
            recipient: profile.email,
            type: 'Reminder',
            subject: `Upcoming: ${item.title} (${new Date(item.date).toLocaleDateString()})`,
            status: Math.random() > 0.1 ? 'Sent' : 'Failed'
          });
       });
    });

    setNotificationLogs(prev => [...newLogs, ...prev]);
  };

  return (
    <DataContext.Provider value={{ 
      semesters, projects, scheduleItems, profiles, enrollments, checkIns, projectStates, notificationLogs,
      currentSemesterId, setCurrentSemesterId, addSemester, toggleSemesterStatus, addProject, addScheduleItem,
      addStudentToSemester, removeStudentFromSemester, addCheckIn, updateProjectStatus, updateInstructorNotes,
      runDailyReminders
    }}>
      {children}
    </DataContext.Provider>
  );
};

const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

// --- Mock Auth Context ---

const AuthContext = createContext(null);

const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  const login = (role) => {
    setUser({
      id: role === ROLES.STUDENT ? 'u-1' : 'u-admin',
      name: role === ROLES.STUDENT ? 'Alex Student (Tag 04)' : `JDBB Staff (${role})`,
      role: role,
      email: 'user@jdbb.college.edu'
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- UI Components ---

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false, type = 'button' }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm text-sm";
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95";
  
  const outlineStyle = { 
    border: `2px solid ${COLORS.pacificCyan}`, 
    color: COLORS.pacificCyan, 
    backgroundColor: 'transparent' 
  };

  const styles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: COLORS.emerald, color: 'white' },
    secondary: { backgroundColor: COLORS.dustyGrape, color: 'white' },
    outline: outlineStyle,
    danger: { backgroundColor: COLORS.vintageGrape, color: 'white' },
    ghost: { backgroundColor: 'transparent', boxShadow: 'none' } 
  };

  const variantClass = variant === 'ghost' ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : '';

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${widthClass} ${disabledClass} ${className} ${variantClass}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
};

// --- Login Screen ---

const LoginScreen = () => {
  const { login } = useAuth();
  const { isDark } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border-t-4 transition-colors" style={{ borderColor: COLORS.emerald }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: isDark ? COLORS.white : COLORS.dustyGrape }}>
            JDBB Project Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Select a role to enter the prototype.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Staff Access</p>
            <Button onClick={() => login(ROLES.ADMIN_TECH)} variant="secondary" fullWidth>
              <Shield size={18} /> Admin Technologist
            </Button>
            <Button onClick={() => login(ROLES.ADMIN_INSTRUCTOR)} variant="secondary" fullWidth>
              <Users size={18} /> Admin Instructor
            </Button>
            <Button onClick={() => login(ROLES.MONITOR)} variant="outline" fullWidth>
              <CheckCircle size={18} /> Monitor
            </Button>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Student Access</p>
            <Button onClick={() => login(ROLES.STUDENT)} variant="primary" fullWidth>
              <User size={18} /> Student Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- View: Project Detail ---

const ProjectDetail = ({ projectId, onBack, targetStudentId }: { projectId: string; onBack: () => void; targetStudentId?: string }) => {
  const { projects, scheduleItems, checkIns, addCheckIn, projectStates, updateProjectStatus, updateInstructorNotes, profiles } = useData();
  const { user } = useAuth();
  
  const effectiveStudentId = targetStudentId || user.id;
  const isInstructorReview = !!targetStudentId && user.role !== ROLES.STUDENT;

  const project = projects.find(p => p.id === projectId);
  const relevantSchedule = scheduleItems.filter(s => s.projectId === projectId || s.type === 'critique').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const studentCheckIns = checkIns.filter(c => c.projectId === projectId && c.studentId === effectiveStudentId);
  const studentState = projectStates.find(s => s.projectId === projectId && s.studentId === effectiveStudentId);
  const currentStatus = studentState?.status || 'not_started';
  const instructorNotes = studentState?.instructorNotes || '';
  const studentProfile = profiles.find(p => p.id === effectiveStudentId);

  const [note, setNote] = useState('');
  const [instructorNoteInput, setInstructorNoteInput] = useState(instructorNotes);
  const [hasFile, setHasFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note && !hasFile) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addCheckIn({
        projectId,
        studentId: effectiveStudentId,
        date: new Date().toISOString(),
        type: isInstructorReview ? 'instructor_comment' : 'progress',
        content: note,
        imageMockUrl: hasFile ? 'https://via.placeholder.com/300' : undefined
      });
      setNote('');
      setHasFile(false);
      setIsSubmitting(false);
    }, 600);
  };

  const handleStatusChange = (newStatus: StudentProjectState['status']) => {
    updateProjectStatus(projectId, effectiveStudentId, newStatus);
  };

  const handleSaveNotes = () => {
    updateInstructorNotes(projectId, effectiveStudentId, instructorNoteInput);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'not_started': return COLORS.textLight;
      case 'in_progress': return COLORS.pacificCyan;
      case 'submitted': return COLORS.vintageGrape;
      case 'reviewed': return COLORS.limeCream;
      default: return COLORS.textLight;
    }
  };

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="mt-1 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{project.code}</span>
                  <span className="text-xs uppercase tracking-wider font-bold" style={{ color: getStatusColor(currentStatus) }}>
                    {currentStatus.replace('_', ' ')}
                  </span>
                  {isInstructorReview && (
                    <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      • Reviewing: <span className="text-slate-800 dark:text-slate-200 font-bold">{studentProfile?.fullName}</span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
             </div>
             <div className="flex gap-2">
                {!isInstructorReview && currentStatus !== 'submitted' && currentStatus !== 'reviewed' && (
                  <Button variant="outline" onClick={() => handleStatusChange('submitted')} className="text-xs h-8">Mark as Submitted</Button>
                )}
                 {!isInstructorReview && currentStatus === 'submitted' && (
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full"><CheckCircle size={14} /> Submitted for Review</span>
                )}
                {isInstructorReview && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleStatusChange('in_progress')} className="text-xs h-8">Reset to In Progress</Button>
                    <Button variant="primary" onClick={() => handleStatusChange('reviewed')} className="text-xs h-8" disabled={currentStatus === 'reviewed'}>Mark Reviewed</Button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           {isInstructorReview && (
             <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-l-4 p-6" style={{ borderColor: COLORS.dustyGrape }}>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2"><Lock size={16} /> Private Instructor Notes</h3>
                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm text-slate-800 dark:text-slate-200 focus:border-emerald-500 outline-none" rows={4} value={instructorNoteInput} onChange={(e) => setInstructorNoteInput(e.target.value)} onBlur={handleSaveNotes} placeholder="Enter private notes here..." />
             </div>
           )}
           <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Project Brief</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.description || "No description provided."}</p>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Calendar size={18} /> Schedule</h3>
              <div className="space-y-4">
                 {relevantSchedule.map(item => (
                   <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                         <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: item.type === 'due' ? COLORS.vintageGrape : COLORS.pacificCyan }}></div>
                         <div className="w-px h-full bg-slate-100 dark:bg-slate-800 my-1"></div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</div>
                      </div>
                   </div>
                 ))}
                 {relevantSchedule.length === 0 && <p className="text-sm text-slate-400">No dates assigned yet.</p>}
              </div>
           </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
               {isInstructorReview ? <><FileText size={18} className="text-purple-500" /> Add Comment to Student</> : <><Camera size={18} className="text-emerald-500" /> New Check-in</>}
             </h3>
             <form onSubmit={handleSubmitCheckIn}>
               <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors" rows={3} placeholder={isInstructorReview ? "Add a feedback comment..." : "What did you work on today?"} value={note} onChange={e => setNote(e.target.value)} />
               <div className="mt-3 flex items-center justify-between">
                  <button type="button" onClick={() => setHasFile(!hasFile)} className={`text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${hasFile ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                    {hasFile ? <CheckCircle size={14} /> : <Camera size={14} />} {hasFile ? 'Photo Attached' : 'Add Photo'}
                  </button>
                  <Button type="submit" variant={isInstructorReview ? "secondary" : "primary"} disabled={(!note && !hasFile) || isSubmitting}>
                     {isSubmitting ? 'Posting...' : <><Send size={14} /> {isInstructorReview ? 'Post Comment' : 'Post Check-in'}</>}
                  </Button>
               </div>
             </form>
          </div>
          <div className="space-y-4">
             {studentCheckIns.map(checkIn => (
               <div key={checkIn.id} className={`rounded-lg shadow-sm border overflow-hidden ${checkIn.type === 'instructor_comment' ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkIn.type === 'instructor_comment' ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                           {checkIn.type === 'instructor_comment' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{checkIn.type === 'instructor_comment' ? 'Instructor' : (isInstructorReview ? studentProfile?.fullName : 'You')}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(checkIn.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                        </div>
                     </div>
                  </div>
                  <div className="p-4">
                     <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{checkIn.content}</p>
                     {checkIn.imageMockUrl && <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center h-48 relative group"><div className="text-slate-400 flex flex-col items-center"><Camera size={32} className="mb-2 opacity-50" /><span className="text-xs">Image Placeholder</span></div></div>}
                  </div>
               </div>
             ))}
             {studentCheckIns.length === 0 && <div className="text-center py-12 text-slate-400">No check-ins yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- View: Student Profile (Admin) ---

const StudentProfile = ({ studentId, onBack, onSelectProject }: { studentId: string; onBack: () => void; onSelectProject: (projectId: string, studentId: string) => void }) => {
  const { profiles, enrollments, projects, currentSemesterId, projectStates } = useData();
  const student = profiles.find(p => p.id === studentId);
  const enrollment = enrollments.find(e => e.profileId === studentId && e.semesterId === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semesterId === currentSemesterId);

  if (!student || !enrollment) return <div>Student not found in this semester.</div>;
  const getStatus = (projectId: string) => projectStates.find(s => s.projectId === projectId && s.studentId === studentId)?.status || 'not_started';

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row gap-6 items-start">
         <button onClick={onBack} className="mt-1 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" /></button>
         <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex-1 w-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-bl-full -mr-16 -mt-16 z-0"></div>
             <div className="relative z-10 flex items-center gap-6">
                 <div className="w-20 h-20 rounded-lg bg-slate-800 text-white flex flex-col items-center justify-center font-bold shadow-lg" style={{ backgroundColor: COLORS.dustyGrape }}>
                    <span className="text-xs uppercase tracking-widest opacity-70">Tag</span>
                    <span className="text-3xl font-mono">{enrollment.tagNumber}</span>
                 </div>
                 <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{student.fullName}</h1>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                       <span className="flex items-center gap-1"><Shield size={14}/> {enrollment.studentNumber}</span>
                       <span className="flex items-center gap-1"><Send size={14}/> {student.email}</span>
                    </div>
                 </div>
             </div>
         </div>
       </div>
       <div>
         <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Layout size={20} className="text-slate-400" /> Project Status</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesterProjects.map(project => {
               const status = getStatus(project.id);
               return (
                  <button key={project.id} onClick={() => onSelectProject(project.id, studentId)} className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors group relative overflow-hidden">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{project.code}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status === 'reviewed' ? 'bg-lime-100 text-lime-800' : status === 'submitted' ? 'bg-purple-100 text-purple-800' : status === 'in_progress' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-500'}`}>{status.replace('_', ' ')}</span>
                     </div>
                     <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{project.title}</h4>
                  </button>
               );
            })}
         </div>
       </div>
    </div>
  );
};

// --- View: Progress Matrix (Admin) ---

const ProgressMatrix = ({ onSelectStudent }: { onSelectStudent: (studentId: string) => void }) => {
  const { currentSemesterId, semesters, projects, enrollments, profiles, projectStates, updateProjectStatus } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = useMemo(() => projects.filter(p => p.semesterId === currentSemesterId), [projects, currentSemesterId]);
  const semesterEnrollments = useMemo(() => enrollments.filter(e => e.semesterId === currentSemesterId).sort((a, b) => parseInt(a.tagNumber) - parseInt(b.tagNumber)), [enrollments, currentSemesterId]);
  const [selectedCell, setSelectedCell] = useState<{enrollmentId: string, projectId: string} | null>(null);

  const getStatus = (studentId: string, projectId: string) => projectStates.find(s => s.projectId === projectId && s.studentId === studentId)?.status || 'not_started';
  const getStatusStyle = (status: StudentProjectState['status']) => {
    switch(status) {
      case 'not_started': return "bg-slate-100 dark:bg-slate-800";
      case 'in_progress': return "bg-cyan-200 dark:bg-cyan-900/50 text-cyan-900 dark:text-cyan-100";
      case 'submitted': return "bg-[#525174] text-white";
      case 'reviewed': return "bg-[#BCE784] text-slate-900";
      default: return "";
    }
  };
  const getStatusLabel = (status: StudentProjectState['status']) => {
     switch(status) {
      case 'not_started': return "-";
      case 'in_progress': return "IP";
      case 'submitted': return "S";
      case 'reviewed': return "OK";
      default: return "";
    }
  };
  const handleStatusUpdate = (newStatus: StudentProjectState['status']) => {
     if (!selectedCell) return;
     const enrollment = enrollments.find(e => e.id === selectedCell.enrollmentId);
     if (enrollment) { updateProjectStatus(selectedCell.projectId, enrollment.profileId, newStatus); setSelectedCell(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Class Progress</h2><p className="text-slate-500 dark:text-slate-400">Tracker for {currentSemester?.name}</p></div>
        <div className="flex gap-2"><Button variant="outline"><Filter size={16}/> Filter</Button></div>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 w-48">Student</th>
              {semesterProjects.map(p => <th key={p.id} className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center min-w-[100px] border-l border-slate-100 dark:border-slate-800">{p.code}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {semesterEnrollments.map(enrollment => {
              const profile = profiles.find(p => p.id === enrollment.profileId);
              return (
                <tr key={enrollment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 border-r border-slate-100 dark:border-slate-800 cursor-pointer" onClick={() => onSelectStudent(enrollment.profileId)}>
                    <div className="flex items-center gap-3"><span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">{enrollment.tagNumber}</span><div className="truncate w-32 font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition-colors" title={profile?.fullName}>{profile?.fullName}</div></div>
                  </td>
                  {semesterProjects.map(project => {
                    const status = getStatus(enrollment.profileId, project.id);
                    return (<td key={project.id} className="p-2 border-l border-slate-100 dark:border-slate-800 text-center"><button onClick={() => setSelectedCell({enrollmentId: enrollment.id, projectId: project.id})} className={`w-full h-10 rounded text-xs font-bold transition-transform active:scale-95 flex items-center justify-center ${getStatusStyle(status)}`}>{getStatusLabel(status)}</button></td>);
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 dark:text-slate-100">Update Status</h3><button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => handleStatusUpdate('not_started')} className="p-3 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300">Not Started</button>
                 <button onClick={() => handleStatusUpdate('in_progress')} className="p-3 rounded bg-cyan-100 text-cyan-900 hover:bg-cyan-200 text-sm font-bold">In Progress</button>
                 <button onClick={() => handleStatusUpdate('submitted')} className="p-3 rounded text-white hover:opacity-90 text-sm font-bold" style={{ backgroundColor: COLORS.dustyGrape }}>Submitted</button>
                 <button onClick={() => handleStatusUpdate('reviewed')} className="p-3 rounded text-slate-900 hover:opacity-90 text-sm font-bold" style={{ backgroundColor: COLORS.limeCream }}>Reviewed</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- View: Semesters (Admin) ---

const SemesterManager = () => {
  const { semesters, setCurrentSemesterId, currentSemesterId, addSemester, toggleSemesterStatus } = useData();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const isAdmin = user.role === ROLES.ADMIN_TECH;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode || !newStartDate) return;
    addSemester({ name: newName, courseCode: newCode, startDate: newStartDate, isActive: true });
    setIsCreating(false); setNewName(''); setNewCode(''); setNewStartDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Semesters</h2><p className="text-slate-500 dark:text-slate-400">Manage course instances and archives.</p></div>
        {isAdmin && <Button variant="primary" onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : <><Plus size={18} /> New Semester</>}</Button>}
      </div>
      {isCreating && isAdmin && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50">
           <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Name</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm dark:text-slate-100" required /></div>
             <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Code</label><input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm dark:text-slate-100" required /></div>
             <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Start Date</label><input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm dark:text-slate-100" required /></div>
             <Button type="submit" variant="primary" fullWidth>Create</Button>
           </form>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr><th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Name</th><th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th><th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {semesters.map((sem) => (
              <tr key={sem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{sem.name}</td>
                <td className="px-6 py-4">{sem.isActive ? <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span> : <span className="text-xs font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">Archived</span>}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  {currentSemesterId !== sem.id ? <Button variant="outline" onClick={() => setCurrentSemesterId(sem.id)} className="text-xs py-1 h-8">Select</Button> : <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><CheckCircle size={14} /> Selected</span>}
                  {isAdmin && <button onClick={() => toggleSemesterStatus(sem.id)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{sem.isActive ? <Archive size={16} /> : <Power size={16} />}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- View: Admin Settings ---

const AdminSettings = () => {
  const { notificationLogs, runDailyReminders } = useData();
  const [isRunning, setIsRunning] = useState(false);
  const handleRunReminders = () => { setIsRunning(true); setTimeout(() => { runDailyReminders(); setIsRunning(false); }, 1000); };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Settings</h2><p className="text-slate-500 dark:text-slate-400">System configuration and notification logs.</p></div>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
           <div className="flex justify-between items-start mb-4"><h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Settings size={18} /> Configuration</h3><Button onClick={handleRunReminders} disabled={isRunning} variant="primary">{isRunning ? 'Sending...' : <><Play size={16} /> Run Daily Reminders</>}</Button></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Timezone</div><div className="font-mono text-sm text-slate-800 dark:text-slate-200">America/Toronto</div></div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900"><h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Mail size={18} /> Notification Log</h3></div>
           <table className="w-full text-left">
             <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
               <tr><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Time</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Recipient</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th></tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {notificationLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-6 py-4 text-xs text-slate-500">{new Date(log.date).toLocaleTimeString()}</td><td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{log.recipient}</td><td className="px-6 py-4"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${log.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span></td></tr>))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

// --- View: Roster Manager ---

const RosterManager = ({ onSelectStudent }: { onSelectStudent?: (id: string) => void }) => {
  const { profiles, enrollments, currentSemesterId, semesters, addStudentToSemester, removeStudentFromSemester } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newStudentNum, setNewStudentNum] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  const semesterEnrollments = enrollments.filter(e => e.semesterId === currentSemesterId);
  const rosterData = semesterEnrollments.map(enrollment => ({ ...enrollment, profile: profiles.find(p => p.id === enrollment.profileId) })).sort((a, b) => parseInt(a.tagNumber) - parseInt(b.tagNumber));

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    addStudentToSemester({ name: newName, email: newEmail, studentNumber: newStudentNum, tagNumber: newTag }, currentSemesterId);
    setIsAdding(false); setNewName(''); setNewEmail(''); setNewStudentNum(''); setNewTag('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Roster</h2></div><Button variant="primary" onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancel' : <><UserPlus size={18} /> Add Student</>}</Button></div>
      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50">
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tag #</label><input type="text" maxLength={2} value={newTag} onChange={e => setNewTag(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student #</label><input type="text" value={newStudentNum} onChange={e => setNewStudentNum(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div>
            <Button type="submit" variant="primary" fullWidth>Confirm</Button>
          </form>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase w-24 text-center">Tag #</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rosterData.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-center cursor-pointer font-mono" onClick={() => onSelectStudent && onSelectStudent(record.profileId)}>{record.tagNumber}</td>
                <td className="px-6 py-4 cursor-pointer font-bold text-slate-800 dark:text-slate-200" onClick={() => onSelectStudent && onSelectStudent(record.profileId)}>{record.profile?.fullName}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => removeStudentFromSemester(record.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- View: Project Manager ---

const ProjectManager = ({ onSelectProject }: { onSelectProject?: (id: string) => void }) => {
  const { projects, currentSemesterId, semesters, projectStates, addProject } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semesterId === currentSemesterId);
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const getStatus = (projectId: string) => (!user ? 'draft' : projectStates.find(s => s.projectId === projectId && s.studentId === user.id)?.status || 'not_started');
  const handleCreate = (e: React.FormEvent) => { e.preventDefault(); addProject({ semesterId: currentSemesterId, code: newCode, title: newTitle, description: newDesc, isPublished }); setIsCreating(false); setNewCode(''); setNewTitle(''); setNewDesc(''); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Projects</h2><p className="text-slate-500 dark:text-slate-400">{currentSemester?.name}</p></div>{user.role !== ROLES.STUDENT && <Button variant="primary" onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : <><Plus size={18} /> New Project</>}</Button>}</div>
      {isCreating && user.role !== ROLES.STUDENT && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50 mb-6">
           <form onSubmit={handleCreate} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code</label><input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div><div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label><textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" /></div>
             <div className="flex items-center gap-4"><label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} /> Publish immediately</label></div>
             <div className="flex justify-end"><Button type="submit" variant="primary">Create</Button></div>
           </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesterProjects.map(project => {
          const status = getStatus(project.id);
          return (
            <div key={project.id} onClick={() => onSelectProject && onSelectProject(project.id)} className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group">
              <div className="space-y-4">
                <div className="flex justify-between items-start"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-300">{project.code}</span>{user.role !== ROLES.STUDENT ? (project.isPublished ? <span className="text-xs font-bold text-emerald-500">Published</span> : <span className="text-xs font-bold text-slate-400">Draft</span>) : (<span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status === 'reviewed' ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-500'}`}>{status.replace('_', ' ')}</span>)}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{project.title}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- View: Schedule Manager ---

const ScheduleManager = () => {
  const { scheduleItems, currentSemesterId, semesters, addScheduleItem } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterItems = scheduleItems.filter(s => s.semesterId === currentSemesterId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<ScheduleItem['type']>('due');

  const handleAdd = (e: React.FormEvent) => { e.preventDefault(); addScheduleItem({ semesterId: currentSemesterId, title: newItemTitle, date: newItemDate, type: newItemType }); setNewItemTitle(''); };
  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'due': return { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300', label: 'Due Date' };
      case 'demo': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Demo' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', label: type };
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Schedule</h2><p className="text-slate-500 dark:text-slate-400">Timeline for {currentSemester?.name}</p></div>
      {user.role !== ROLES.STUDENT && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
            <input type="date" value={newItemDate} onChange={(e) => setNewItemDate(e.target.value)} className="border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required />
            <select value={newItemType} onChange={(e) => setNewItemType(e.target.value as any)} className="border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"><option value="due">Due Date</option><option value="demo">Demo Day</option><option value="progress_check">Progress Check</option></select>
            <input type="text" placeholder="Event Title" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} className="border p-2 rounded text-sm flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required />
            <Button type="submit" variant="primary"><Plus size={16} /> Add</Button>
          </form>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {semesterItems.map(item => {
          const style = getTypeStyle(item.type);
          const dateObj = new Date(item.date);
          return (
            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-16 text-center"><div className="text-xs font-bold text-slate-400 uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div><div className="text-xl font-bold text-slate-800 dark:text-slate-100">{dateObj.getDate()}</div></div>
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>{style.label}</span></div><div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- View Content (Dashboards Redesigned) ---

const StudentDashboard = () => {
  const { currentSemesterId, semesters, scheduleItems, projects, projectStates } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const upcomingItems = scheduleItems
    .filter(s => s.semesterId === currentSemesterId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const activeProject = projects.find(p => p.isPublished) || projects[0];
  const activeProjectState = activeProject ? projectStates.find(ps => ps.projectId === activeProject.id && ps.studentId === user.id) : null;
  const status = activeProjectState?.status || 'not_started';

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div><div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div><h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user.name.split(' ')[0]}.</h2></div>
        <div className="text-right hidden md:block"><div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Current Semester</div><div className="text-lg font-bold text-emerald-500">{currentSemester?.name}</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-900 dark:to-teal-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700"><Layout size={120} /></div>
           <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-4"><Clock size={12} /> Current Focus</div>
             {activeProject ? (
               <><h3 className="text-3xl font-bold mb-2">{activeProject.title}</h3><p className="text-emerald-100 max-w-md mb-6">{activeProject.description || "Complete the required steps to submit your work for review."}</p>
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-lg">
                    <div className="flex justify-between items-center mb-2 text-sm font-bold"><span>Status: {status.replace('_', ' ')}</span><span>{status === 'submitted' ? '100%' : status === 'in_progress' ? '50%' : '0%'}</span></div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: status === 'submitted' ? '100%' : status === 'in_progress' ? '50%' : '5%' }}></div></div>
                 </div>
                 <div className="mt-6 flex gap-3"><Button className="bg-white text-emerald-900 hover:bg-emerald-50 border-none shadow-lg">Continue Work <ArrowLeft className="rotate-180" size={16} /></Button><Button variant="outline" className="text-white border-white/30 hover:bg-white/10">View Rubric</Button></div></>
             ) : (<p>No active projects.</p>)}
           </div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: COLORS.vintageGrape }}>
           <div className="absolute -bottom-4 -right-4 text-white/5"><AlertCircle size={100} /></div>
           <div><h4 className="text-white/70 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2"><AlertTriangle size={14} /> Critical Deadline</h4><div className="text-4xl font-bold mb-1">2 Days</div><div className="text-white/80 font-medium">Until P1 Submission</div></div>
           <div className="mt-8 pt-6 border-t border-white/10"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Calendar size={20} /></div><div><div className="text-sm font-bold">Feb 01, 2026</div><div className="text-xs text-white/60">Midnight EST</div></div></div></div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6"><h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Calendar size={20} className="text-slate-400" /> Upcoming Schedule</h3><button className="text-xs font-bold text-emerald-500 hover:text-emerald-600">View All</button></div>
           <div className="space-y-4">
              {upcomingItems.map(item => (
                <div key={item.id} className="flex items-center group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                   <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"><span className="text-xs font-bold uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span><span className="text-lg font-bold">{new Date(item.date).getDate()}</span></div>
                   <div className="ml-4 flex-1"><div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div><div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{item.type.replace('_', ' ')}</div></div>
                   <div className="px-4">{item.type === 'due' && <span className="text-xs font-bold text-white px-2 py-1 rounded bg-red-500">DUE</span>}</div>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><Settings size={20} className="text-slate-400" /> Quick Actions</h3>
           <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 border border-transparent transition-all group text-left"><div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Camera size={20} /></div><div><div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Post Check-in</div><div className="text-xs text-slate-500">Upload a photo</div></div></button>
              <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 border border-transparent transition-all group text-left"><div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Layout size={20} /></div><div><div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">View Timeline</div><div className="text-xs text-slate-500">P1 Full Schedule</div></div></button>
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { currentSemesterId, semesters, projects, checkIns, scheduleItems } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semesterId === currentSemesterId);
  const stats = [
    { label: 'Active Students', val: '24', icon: Users, color: COLORS.emerald, sub: '+2 this week' },
    { label: 'Projects Published', val: semesterProjects.length.toString(), icon: Layout, color: COLORS.pacificCyan, sub: 'On track' },
    { label: 'Pending Reviews', val: '8', icon: FileText, color: COLORS.limeCream, textColor: 'text-slate-800', sub: 'Needs attention' },
    { label: 'Overdue Alerts', val: '3', icon: AlertTriangle, color: COLORS.vintageGrape, sub: 'Urgent' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
       <div className="flex justify-between items-end">
          <div><h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h2><p className="text-slate-500 dark:text-slate-400 mt-1">Overview for {currentSemester?.name || '...'} </p></div>
          <div className="flex gap-2"><Button variant="outline"><Download size={16} /> Report</Button><Button variant="primary"><Plus size={16} /> New Announcement</Button></div>
       </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="flex justify-between items-start"><div className="relative z-10"><div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">{stat.val}</div><div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div><div className="mt-4 text-xs font-bold px-2 py-1 rounded-full inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{stat.sub}</div></div><div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: stat.color, color: stat.textColor || 'white' }}><stat.icon size={24} /></div></div>
             <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: stat.color }}></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Recent Check-ins</h3><button className="text-emerald-500 hover:text-emerald-600 text-sm font-bold">View All</button></div>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
               {checkIns.slice(0, 5).map(ci => (
                  <div key={ci.id} className="py-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors px-2 rounded-xl">
                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0"><User size={18} className="text-slate-400" /></div>
                     <div className="flex-1"><div className="flex justify-between items-start"><span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Student ID {ci.studentId.split('-')[1]}</span><span className="text-xs text-slate-400">{new Date(ci.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div><p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{ci.content}</p></div>
                  </div>
               ))}
               {checkIns.length === 0 && <div className="py-12 text-center text-slate-400">No recent activity.</div>}
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">Upcoming Events</h3>
            <div className="space-y-4">
               {scheduleItems.slice(0, 4).map(item => (
                  <div key={item.id} className="flex gap-4">
                     <div className="flex flex-col items-center w-12 pt-1"><span className="text-xs font-bold text-slate-400 uppercase">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span><span className="text-lg font-bold text-slate-800 dark:text-slate-200">{new Date(item.date).getDate()}</span></div>
                     <div className="flex-1 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0"><div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</div><div className="flex items-center gap-2 mt-1"><span className={`w-2 h-2 rounded-full ${item.type === 'due' ? 'bg-red-500' : 'bg-emerald-500'}`}></span><span className="text-xs text-slate-500 capitalize">{item.type.replace('_', ' ')}</span></div></div>
                  </div>
               ))}
            </div>
            <button className="w-full mt-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Open Calendar</button>
         </div>
      </div>
    </div>
  );
};

// --- App Shell Components ---

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed w-full z-20 top-0 flex items-center justify-between px-4 lg:px-6 transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Menu size={24} /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xs shadow-emerald-500/20 shadow-lg">JDBB</div>
          <span className="font-bold text-lg hidden md:block tracking-tight" style={{ color: isDark ? COLORS.white : COLORS.dustyGrape }}>Project Tracker</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
        <div className="hidden md:flex flex-col items-end"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span><span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full text-white font-bold shadow-sm" style={{ backgroundColor: user.role === ROLES.STUDENT ? COLORS.pacificCyan : COLORS.dustyGrape }}>{user.role}</span></div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sign Out"><LogOut size={20} /></button>
      </div>
    </header>
  );
};

const Sidebar = ({ isOpen, close, currentView, setView }) => {
  const { user } = useAuth();
  const { currentSemesterId, semesters } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const { isDark } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout, roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] },
    { id: 'projects', label: 'Projects', icon: Tag, roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] },
    { id: 'schedule', label: 'Schedule', icon: Calendar, roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] },
    { id: 'matrix', label: 'Class Progress', icon: BarChart3, roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR] },
    { id: 'roster', label: 'Student Roster', icon: Users, roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR] },
    { id: 'semesters', label: 'Semesters', icon: Shield, roles: [ROLES.ADMIN_TECH] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [ROLES.ADMIN_TECH] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={close} />}
      <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        <nav className="p-4 space-y-1 flex-1">
          {allowedItems.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); close(); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors group ${currentView === item.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}>
              <item.icon size={20} style={{ color: currentView === item.id ? COLORS.emerald : (isDark ? COLORS.pacificCyan : COLORS.pacificCyan) }} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors">
           <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Current Semester</div>
           {currentSemester ? <><div className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate" title={currentSemester.name}>{currentSemester.name}</div><div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentSemester.courseCode}</div></> : <div className="text-xs text-slate-400">No Semester Selected</div>}
        </div>
      </aside>
    </>
  );
};

const AppShell = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (!user) return <LoginScreen />;

  const handleSelectProject = (projectId: string) => { setSelectedProjectId(projectId); setCurrentView('project_detail'); };
  const handleSelectStudent = (studentId: string) => { setSelectedStudentId(studentId); setCurrentView('student_profile'); };
  const handleInstructorSelectProject = (projectId: string, studentId: string) => { setSelectedProjectId(projectId); setSelectedStudentId(studentId); setCurrentView('project_detail'); };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />;
      case 'semesters': return <SemesterManager />;
      case 'projects': return <ProjectManager onSelectProject={handleSelectProject} />;
      case 'project_detail': return <ProjectDetail projectId={selectedProjectId!} targetStudentId={selectedStudentId} onBack={() => selectedStudentId ? setCurrentView('student_profile') : setCurrentView('projects')} />;
      case 'student_profile': return <StudentProfile studentId={selectedStudentId!} onBack={() => setCurrentView('roster')} onSelectProject={handleInstructorSelectProject} />;
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