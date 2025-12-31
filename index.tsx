import React, { useState, createContext, useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { User, Shield, Users, Calendar, Layout, LogOut, Menu, CheckCircle, AlertCircle, Plus, MoreHorizontal, Clock, Tag, UserPlus, Trash2, Search, Sun, Moon } from 'lucide-react';

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
}

interface ScheduleItem {
  id: string;
  semesterId: string;
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

// --- Theme Context ---

const ThemeContext = createContext({
  isDark: true, // Default to dark per request
  toggleTheme: () => {}
});

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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
  currentSemesterId: string;
  setCurrentSemesterId: (id: string) => void;
  addSemester: (sem: Omit<Semester, 'id'>) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  addStudentToSemester: (student: { name: string; email: string; studentNumber: string; tagNumber: string }, semesterId: string) => void;
  removeStudentFromSemester: (enrollmentId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const initialSemesters: Semester[] = [
  { id: 'sem-1', name: 'Winter 2026 – Modelmaking & Casting', courseCode: 'JJEW-100', isActive: true, startDate: '2026-01-08' },
  { id: 'sem-2', name: 'Fall 2025 – Fabrication 1', courseCode: 'JJEW-100', isActive: false, startDate: '2025-09-05' },
];

const initialProjects: Project[] = [
  { id: 'p-1', semesterId: 'sem-1', code: 'P1', title: 'Orthographic Rendering', isPublished: true },
  { id: 'p-2', semesterId: 'sem-1', code: 'P2', title: 'Wax Carving Basics', isPublished: true },
  { id: 'p-3', semesterId: 'sem-1', code: 'P3', title: 'Lost Wax Casting', isPublished: false },
];

const initialSchedule: ScheduleItem[] = [
  { id: 's-1', semesterId: 'sem-1', title: 'P1 Due Date', date: '2026-02-01', type: 'due' },
  { id: 's-2', semesterId: 'sem-1', title: 'P2 Demo Day', date: '2026-02-03', type: 'demo' },
];

const initialProfiles: Profile[] = [
  { id: 'u-1', email: 'alex@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Alex Student' },
  { id: 'u-2', email: 'sam@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Sam Jeweler' },
  { id: 'u-3', email: 'casey@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Casey Caster' },
];

const initialEnrollments: Enrollment[] = [
  { id: 'e-1', profileId: 'u-1', semesterId: 'sem-1', studentNumber: 'S1000001', tagNumber: '04', status: 'active' },
  { id: 'e-2', profileId: 'u-2', semesterId: 'sem-1', studentNumber: 'S1000002', tagNumber: '12', status: 'active' },
];

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(initialSchedule);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [currentSemesterId, setCurrentSemesterId] = useState<string>('sem-1');

  const addSemester = (sem: Omit<Semester, 'id'>) => {
    const newSem = { ...sem, id: `sem-${Date.now()}` };
    setSemesters([...semesters, newSem]);
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

  return (
    <DataContext.Provider value={{ 
      semesters, projects, scheduleItems, profiles, enrollments,
      currentSemesterId, setCurrentSemesterId, addSemester, addScheduleItem,
      addStudentToSemester, removeStudentFromSemester
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

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  const login = (role) => {
    setUser({
      id: '123-uuid',
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
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false }: ButtonProps) => {
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

// --- View: Semesters (Admin) ---

const SemesterList = () => {
  const { semesters, setCurrentSemesterId, currentSemesterId } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Semesters</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage course instances and archives.</p>
        </div>
        <Button variant="primary">
          <Plus size={18} /> New Semester
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course Code</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {semesters.map((sem) => (
              <tr key={sem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{sem.name}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{sem.courseCode}</td>
                <td className="px-6 py-4">
                  {sem.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      Archived
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {currentSemesterId !== sem.id && (
                     <Button 
                       variant="outline" 
                       onClick={() => setCurrentSemesterId(sem.id)}
                       className="text-xs py-1 h-8"
                     >
                       Select
                     </Button>
                  )}
                  {currentSemesterId === sem.id && (
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <CheckCircle size={14} /> Selected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- View: Roster Manager (Admin) ---

const RosterManager = () => {
  const { profiles, enrollments, currentSemesterId, semesters, addStudentToSemester, removeStudentFromSemester } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentNum, setNewStudentNum] = useState('');
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  // Derived Data
  const semesterEnrollments = enrollments.filter(e => e.semesterId === currentSemesterId);
  
  const rosterData = semesterEnrollments.map(enrollment => {
    const profile = profiles.find(p => p.id === enrollment.profileId);
    return {
      ...enrollment,
      profile
    };
  }).sort((a, b) => parseInt(a.tagNumber) - parseInt(b.tagNumber));

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!/^\d{2}$/.test(newTag)) {
      setError('Tag number must be exactly two digits (e.g., 01, 99).');
      return;
    }
    const tagExists = semesterEnrollments.some(e => e.tagNumber === newTag);
    if (tagExists) {
      setError(`Tag number ${newTag} is already assigned in this semester.`);
      return;
    }

    // Submit
    addStudentToSemester({
      name: newName,
      email: newEmail,
      studentNumber: newStudentNum,
      tagNumber: newTag
    }, currentSemesterId);

    // Reset
    setIsAdding(false);
    setNewName('');
    setNewEmail('');
    setNewStudentNum('');
    setNewTag('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Roster</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage enrollment for {currentSemester?.name}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                Import CSV
            </Button>
            <Button variant="primary" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'Cancel' : <><UserPlus size={18} /> Add Student</>}
            </Button>
        </div>
      </div>

      {/* Add Student Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-emerald-500" /> New Student Enrollment
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tag # (01-99)</label>
              <input 
                type="text" 
                maxLength={2}
                placeholder="01"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                required
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Student Number</label>
              <input 
                type="text" 
                placeholder="S1234567"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                value={newStudentNum}
                onChange={e => setNewStudentNum(e.target.value)}
                required
              />
            </div>
            <div className="lg:col-span-1">
               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
               <input 
                 type="text" 
                 placeholder="Jane Doe"
                 className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                 value={newName}
                 onChange={e => setNewName(e.target.value)}
                 required
               />
            </div>
             <div className="lg:col-span-1">
               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</label>
               <input 
                 type="email" 
                 placeholder="jane@college.edu"
                 className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                 value={newEmail}
                 onChange={e => setNewEmail(e.target.value)}
                 required
               />
            </div>
            <div className="lg:col-span-1">
              <Button variant="primary" fullWidth className="h-[38px]">
                Confirm
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
           <div className="relative flex-1 max-w-sm">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search students..." 
               className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-sm w-full focus:outline-none focus:border-emerald-400 dark:text-slate-200"
             />
           </div>
           <div className="ml-auto text-sm text-slate-500 dark:text-slate-400 font-medium">
             {rosterData.length} Students Enrolled
           </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24 text-center">Tag #</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Student ID</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Email</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rosterData.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 font-mono">
                    {record.tagNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{record.profile?.fullName}</div>
                    <div className="md:hidden text-xs text-slate-500 dark:text-slate-400">{record.studentNumber}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono hidden md:table-cell">
                   {record.studentNumber}
                </td>
                 <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                   {record.profile?.email}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeStudentFromSemester(record.id)}
                    className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remove from Semester"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {rosterData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No students enrolled in this semester yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- View: Projects (Admin) ---

const ProjectManager = () => {
  const { projects, currentSemesterId, semesters } = useData();
  
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semesterId === currentSemesterId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Projects</h2>
          <p className="text-slate-500 dark:text-slate-400">{currentSemester?.name}</p>
        </div>
        <Button variant="primary">
          <Plus size={18} /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesterProjects.map(project => (
          <div key={project.id} className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-300">{project.code}</span>
                {project.isPublished ? (
                  <span className="text-xs font-bold" style={{ color: COLORS.emerald }}>Published</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Draft</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{project.title}</h3>
            </div>
            
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
               <Button variant="secondary" fullWidth className="text-xs">
                 Edit
               </Button>
               <Button variant="ghost" className="text-xs px-2">
                 <MoreHorizontal size={16} />
               </Button>
            </div>
          </div>
        ))}
        
        {/* Empty State / Add New Card */}
        <button className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-emerald-300 hover:text-emerald-500 transition-colors group h-full min-h-[200px]">
          <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add Project</span>
        </button>
      </div>
    </div>
  );
}

// --- View: Schedule Manager (Admin) ---

const ScheduleManager = () => {
  const { scheduleItems, currentSemesterId, semesters, addScheduleItem } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  
  // Filter and sort items
  const semesterItems = scheduleItems
    .filter(s => s.semesterId === currentSemesterId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Quick Add State
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<ScheduleItem['type']>('due');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDate || !newItemTitle) return;

    addScheduleItem({
      semesterId: currentSemesterId,
      title: newItemTitle,
      date: newItemDate,
      type: newItemType
    });
    
    // Reset form
    setNewItemTitle('');
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'due': return { 
        bg: 'bg-pink-100 dark:bg-pink-900/30', 
        text: 'text-pink-800 dark:text-pink-300', 
        label: 'Due Date', 
        border: 'border-pink-200 dark:border-pink-800' 
      };
      case 'demo': return { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: 'Demo', 
        border: 'border-blue-200 dark:border-blue-800' 
      };
      case 'critique': return { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-300', 
        label: 'Critique', 
        border: 'border-purple-200 dark:border-purple-800' 
      };
      case 'progress_check': return { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-300', 
        label: 'Check-in', 
        border: 'border-orange-200 dark:border-orange-800' 
      };
      case 'lab_day': return { 
        bg: 'bg-slate-100 dark:bg-slate-800', 
        text: 'text-slate-800 dark:text-slate-300', 
        label: 'Lab Day', 
        border: 'border-slate-200 dark:border-slate-700' 
      };
      default: return { 
        bg: 'bg-slate-100 dark:bg-slate-800', 
        text: 'text-slate-800 dark:text-slate-300', 
        label: type, 
        border: 'border-slate-200 dark:border-slate-700' 
      };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Schedule</h2>
        <p className="text-slate-500 dark:text-slate-400">Timeline for {currentSemester?.name}</p>
      </div>

      {/* Quick Add Form */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Clock size={16} /> Quick Add Event
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input 
            type="date" 
            value={newItemDate}
            onChange={(e) => setNewItemDate(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
            required
          />
          <select 
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as any)}
            className="border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="due">Due Date</option>
            <option value="demo">Demo Day</option>
            <option value="progress_check">Progress Check</option>
            <option value="lab_day">Lab Day</option>
            <option value="critique">Critique</option>
          </select>
          <input 
            type="text" 
            placeholder="Event Title (e.g., P1 Final Submission)"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 flex-1 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
            required
          />
          <Button variant="primary" className="whitespace-nowrap">
            <Plus size={16} /> Add to Schedule
          </Button>
        </form>
      </div>

      {/* Schedule List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {semesterItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            No items scheduled yet. Add one above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {semesterItems.map(item => {
              const style = getTypeStyle(item.type);
              const dateObj = new Date(item.date);
              
              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-16 text-center border-r border-slate-100 dark:border-slate-800 pr-4 md:pr-0 md:border-r-0 md:w-24">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {dateObj.getDate()}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                       {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                          {style.label}
                        </span>
                     </div>
                     <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- View Content ---

const StudentDashboard = () => {
  const { currentSemesterId, semesters, scheduleItems } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const upcomingItems = scheduleItems.filter(s => s.semesterId === currentSemesterId);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: COLORS.pacificCyan }}>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hello, Alex.</h2>
        <p className="text-slate-500 dark:text-slate-400">
           {currentSemester ? `Welcome to ${currentSemester.name}.` : "No active semester selected."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Up Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 font-bold flex items-center gap-2 text-white" style={{ backgroundColor: COLORS.vintageGrape }}>
            <AlertCircle size={20} />
            Next Up
          </div>
          <div className="p-4 space-y-4">
             {upcomingItems.length > 0 ? upcomingItems.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-300 dark:border-slate-600 rounded text-sm flex justify-between items-center">
                   <div>
                     <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                     <div className="text-slate-600 dark:text-slate-400 text-xs uppercase font-bold tracking-wide">{item.type.replace('_', ' ')}</div>
                   </div>
                   <div className="text-slate-500 dark:text-slate-400 text-xs text-right">
                     {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </div>
                </div>
             )) : (
               <div className="text-slate-400 dark:text-slate-500 text-center py-4">No upcoming items.</div>
             )}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            Quick Actions
          </div>
          <div className="p-6 flex flex-col gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Upload photos from your phone directly to your project log.</p>
            <Button variant="primary" fullWidth>
              <Calendar size={18} /> View P1 Timeline
            </Button>
            <Button variant="outline" fullWidth>
              View My Grades / Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { currentSemesterId, semesters, projects } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semesterId === currentSemesterId);

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: COLORS.dustyGrape }}>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Semester Overview</h2>
        {currentSemester ? (
           <p className="text-slate-500 dark:text-slate-400">{currentSemester.name} • {semesterProjects.length} Projects Active</p>
        ) : (
           <p className="text-slate-500 dark:text-slate-400">No active semester selected.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        {[
          { label: 'Pending Reviews', val: '8', color: COLORS.emerald },
          { label: 'Overdue Students', val: '3', color: COLORS.vintageGrape },
          { label: 'Days Until Critique', val: '12', color: COLORS.pacificCyan },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.val}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
            </div>
            <div className="h-10 w-1 rounded-full bg-slate-100 dark:bg-slate-800"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- App Shell Components ---

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed w-full z-20 top-0 flex items-center justify-between px-4 lg:px-6 transition-colors">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
            JDBB
          </div>
          <span className="font-bold text-lg hidden md:block" style={{ color: isDark ? COLORS.white : COLORS.dustyGrape }}>Project Tracker</span>
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
            className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full text-white font-bold"
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

const Sidebar = ({ isOpen, close, currentView, setView }) => {
  const { user } = useAuth();
  const { currentSemesterId, semesters } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const { isDark } = useTheme();
  
  // Navigation Items with View IDs
  const menuItems = [
    { 
      id: 'dashboard',
      label: 'Dashboard', 
      icon: Layout, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] 
    },
    { 
      id: 'projects',
      label: 'Projects', 
      icon: Tag, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] 
    },
    { 
      id: 'schedule',
      label: 'Schedule', 
      icon: Calendar, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] 
    },
    { 
      id: 'roster',
      label: 'Student Roster', 
      icon: Users, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR] 
    },
    { 
      id: 'semesters',
      label: 'Semesters', 
      icon: Shield, 
      roles: [ROLES.ADMIN_TECH] 
    },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={close} />
      )}
      
      {/* Sidebar Content */}
      <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out z-30 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        
        <nav className="p-4 space-y-1 flex-1">
          {allowedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); close(); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors group ${
                currentView === item.id 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={20} style={{ color: currentView === item.id ? COLORS.emerald : (isDark ? COLORS.pacificCyan : COLORS.pacificCyan) }} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Semester Context Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors">
           <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Current Semester</div>
           {currentSemester ? (
             <>
               <div className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate" title={currentSemester.name}>{currentSemester.name}</div>
               <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentSemester.courseCode}</div>
             </>
           ) : (
             <div className="text-xs text-slate-400">No Semester Selected</div>
           )}
        </div>
      </aside>
    </>
  );
};

// --- Main App Shell Integration ---

const AppShell = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!user) return <LoginScreen />;

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />;
      case 'semesters':
        return <SemesterList />;
      case 'projects':
        return <ProjectManager />;
      case 'schedule':
        return <ScheduleManager />;
      case 'roster':
        return <RosterManager />;
      default:
        return user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar 
        isOpen={sidebarOpen} 
        close={() => setSidebarOpen(false)} 
        currentView={currentView}
        setView={setCurrentView}
      />
      
      <main className="pt-16 lg:pl-64 min-h-screen transition-all duration-200">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {renderView()}
        </div>
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