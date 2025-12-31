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
    // 1. Find Schedule Items due soon (simulated "next 7 days")
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
            status: Math.random() > 0.1 ? 'Sent' : 'Failed' // 10% simulated failure rate
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

  // Mock User ID mapping for simplicity in this prototype
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
  
  // Custom logic for Outline variant in dark mode to ensure visibility
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
    ghost: { backgroundColor: 'transparent', boxShadow: 'none' } // Color handled by class
  };

  // Add text color class for ghost variant to handle dark/light
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

// --- View Content (Dashboards Redesigned) ---

const StudentDashboard = () => {
  const { currentSemesterId, semesters, scheduleItems, projects, projectStates } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const upcomingItems = scheduleItems
    .filter(s => s.semesterId === currentSemesterId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  // Find the "Active" project (latest one user is working on or first published)
  const activeProject = projects.find(p => p.isPublished) || projects[0];
  const activeProjectState = activeProject ? projectStates.find(ps => ps.projectId === activeProject.id && ps.studentId === user.id) : null;
  const status = activeProjectState?.status || 'not_started';

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user.name.split(' ')[0]}.</h2>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Current Semester</div>
           <div className="text-lg font-bold text-emerald-500">{currentSemester?.name}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Hero: Current Focus */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-900 dark:to-teal-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
              <Layout size={120} />
           </div>
           
           <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-4">
               <Clock size={12} /> Current Focus
             </div>
             
             {activeProject ? (
               <>
                 <h3 className="text-3xl font-bold mb-2">{activeProject.title}</h3>
                 <p className="text-emerald-100 max-w-md mb-6">{activeProject.description || "Complete the required steps to submit your work for review."}</p>
                 
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-lg">
                    <div className="flex justify-between items-center mb-2 text-sm font-bold">
                       <span>Status: {status.replace('_', ' ')}</span>
                       <span>{status === 'submitted' ? '100%' : status === 'in_progress' ? '50%' : '0%'}</span>
                    </div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-white rounded-full transition-all duration-1000" 
                         style={{ width: status === 'submitted' ? '100%' : status === 'in_progress' ? '50%' : '5%' }}
                       ></div>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex gap-3">
                    <Button className="bg-white text-emerald-900 hover:bg-emerald-50 border-none shadow-lg">
                       Continue Work <ArrowLeft className="rotate-180" size={16} />
                    </Button>
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                       View Rubric
                    </Button>
                 </div>
               </>
             ) : (
               <p>No active projects.</p>
             )}
           </div>
        </div>

        {/* Side Widget: Next Deadline */}
        <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: COLORS.vintageGrape }}>
           <div className="absolute -bottom-4 -right-4 text-white/5">
              <AlertCircle size={100} />
           </div>
           
           <div>
             <h4 className="text-white/70 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
               <AlertTriangle size={14} /> Critical Deadline
             </h4>
             <div className="text-4xl font-bold mb-1">2 Days</div>
             <div className="text-white/80 font-medium">Until P1 Submission</div>
           </div>
           
           <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar size={20} />
                 </div>
                 <div>
                    <div className="text-sm font-bold">Feb 01, 2026</div>
                    <div className="text-xs text-white/60">Midnight EST</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Row: Schedule & Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar size={20} className="text-slate-400" /> Upcoming Schedule
              </h3>
              <button className="text-xs font-bold text-emerald-500 hover:text-emerald-600">View All</button>
           </div>
           
           <div className="space-y-4">
              {upcomingItems.map(item => (
                <div key={item.id} className="flex items-center group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                   <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <span className="text-xs font-bold uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-bold">{new Date(item.date).getDate()}</span>
                   </div>
                   <div className="ml-4 flex-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{item.type.replace('_', ' ')}</div>
                   </div>
                   <div className="px-4">
                      {item.type === 'due' && <span className="text-xs font-bold text-white px-2 py-1 rounded bg-red-500">DUE</span>}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Quick Actions Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
             <Settings size={20} className="text-slate-400" /> Quick Actions
           </h3>
           <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 border border-transparent transition-all group text-left">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Camera size={20} />
                 </div>
                 <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Post Check-in</div>
                    <div className="text-xs text-slate-500">Upload a photo</div>
                 </div>
              </button>
              
              <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 border border-transparent transition-all group text-left">
                 <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Layout size={20} />
                 </div>
                 <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">View Timeline</div>
                    <div className="text-xs text-slate-500">P1 Full Schedule</div>
                 </div>
              </button>
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
  
  // Mock Stats
  const stats = [
    { label: 'Active Students', val: '24', icon: Users, color: COLORS.emerald, sub: '+2 this week' },
    { label: 'Projects Published', val: semesterProjects.length.toString(), icon: Layout, color: COLORS.pacificCyan, sub: 'On track' },
    { label: 'Pending Reviews', val: '8', icon: FileText, color: COLORS.limeCream, textColor: 'text-slate-800', sub: 'Needs attention' },
    { label: 'Overdue Alerts', val: '3', icon: AlertTriangle, color: COLORS.vintageGrape, sub: 'Urgent' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
       <div className="flex justify-between items-end">
          <div>
             <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-1">Overview for {currentSemester?.name || '...'} </p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline"><Download size={16} /> Report</Button>
             <Button variant="primary"><Plus size={16} /> New Announcement</Button>
          </div>
       </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="flex justify-between items-start">
                <div className="relative z-10">
                   <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">{stat.val}</div>
                   <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                   <div className="mt-4 text-xs font-bold px-2 py-1 rounded-full inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {stat.sub}
                   </div>
                </div>
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: stat.color, color: stat.textColor || 'white' }}
                >
                   <stat.icon size={24} />
                </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: stat.color }}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Recent Activity Feed */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Recent Check-ins</h3>
               <button className="text-emerald-500 hover:text-emerald-600 text-sm font-bold">View All</button>
            </div>
            
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
               {checkIns.slice(0, 5).map(ci => (
                  <div key={ci.id} className="py-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors px-2 rounded-xl">
                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-slate-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Student ID {ci.studentId.split('-')[1]}</span>
                           <span className="text-xs text-slate-400">{new Date(ci.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{ci.content}</p>
                     </div>
                  </div>
               ))}
               {checkIns.length === 0 && (
                  <div className="py-12 text-center text-slate-400">No recent activity.</div>
               )}
            </div>
         </div>

         {/* Mini Calendar / Schedule */}
         <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">Upcoming Events</h3>
            
            <div className="space-y-4">
               {scheduleItems.slice(0, 4).map(item => (
                  <div key={item.id} className="flex gap-4">
                     <div className="flex flex-col items-center w-12 pt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{new Date(item.date).getDate()}</span>
                     </div>
                     <div className="flex-1 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`w-2 h-2 rounded-full ${item.type === 'due' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                           <span className="text-xs text-slate-500 capitalize">{item.type.replace('_', ' ')}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            
            <button className="w-full mt-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
               Open Calendar
            </button>
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
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xs shadow-emerald-500/20 shadow-lg">
            JDBB
          </div>
          <span className="font-bold text-lg hidden md:block tracking-tight" style={{ color: isDark ? COLORS.white : COLORS.dustyGrape }}>Project Tracker</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
          <span 
            className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full text-white font-bold shadow-sm"
            style={{ backgroundColor: user.role === ROLES.STUDENT ? COLORS.pacificCyan : COLORS.dustyGrape }}
          >
            {user.role}
          </span>
        </div>
        <button 
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};