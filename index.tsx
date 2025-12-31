import React, { useState, createContext, useContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { User, Shield, Users, Calendar, Layout, LogOut, Menu, CheckCircle, AlertCircle, Plus, ChevronRight, MoreHorizontal, Clock, Tag } from 'lucide-react';

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
  name: string; // e.g., "Winter 2026 – Modelmaking"
  courseCode: string;
  isActive: boolean;
  startDate: string;
}

interface Project {
  id: string;
  semesterId: string;
  code: string; // "P1"
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

// --- Mock Data Context ---

interface DataContextType {
  semesters: Semester[];
  projects: Project[];
  scheduleItems: ScheduleItem[];
  currentSemesterId: string;
  setCurrentSemesterId: (id: string) => void;
  addSemester: (sem: Omit<Semester, 'id'>) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
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

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(initialSchedule);
  const [currentSemesterId, setCurrentSemesterId] = useState<string>('sem-1');

  const addSemester = (sem: Omit<Semester, 'id'>) => {
    const newSem = { ...sem, id: `sem-${Date.now()}` };
    setSemesters([...semesters, newSem]);
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem = { ...item, id: `s-${Date.now()}` };
    setScheduleItems([...scheduleItems, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  return (
    <DataContext.Provider value={{ 
      semesters, projects, scheduleItems, 
      currentSemesterId, setCurrentSemesterId, addSemester, addScheduleItem
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

// --- Mock Auth Context (MVP Step 2) ---

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
}

const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm text-sm";
  const widthClass = fullWidth ? "w-full" : "";
  
  const styles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: COLORS.emerald, color: 'white' },
    secondary: { backgroundColor: COLORS.dustyGrape, color: 'white' },
    outline: { border: `2px solid ${COLORS.pacificCyan}`, color: COLORS.pacificCyan, backgroundColor: 'transparent' },
    danger: { backgroundColor: COLORS.vintageGrape, color: 'white' },
    ghost: { backgroundColor: 'transparent', color: COLORS.textLight, boxShadow: 'none' }
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${widthClass} ${className} hover:opacity-90 active:scale-95`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
};

// --- Login Screen ---

const LoginScreen = () => {
  const { login } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border-t-4" style={{ borderColor: COLORS.emerald }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.dustyGrape }}>JDBB Project Tracker</h1>
          <p className="text-slate-500">Select a role to enter the prototype.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Access</p>
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
          
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Access</p>
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
          <h2 className="text-2xl font-bold text-slate-800">Semesters</h2>
          <p className="text-slate-500">Manage course instances and archives.</p>
        </div>
        <Button variant="primary">
          <Plus size={18} /> New Semester
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Code</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {semesters.map((sem) => (
              <tr key={sem.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{sem.name}</td>
                <td className="px-6 py-4 text-slate-500">{sem.courseCode}</td>
                <td className="px-6 py-4">
                  {sem.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" style={{ backgroundColor: '#e6f7e6', color: '#2d6a4f' }}>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
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
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
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

// --- View: Projects (Admin) ---

const ProjectManager = () => {
  const { projects, currentSemesterId, semesters } = useData();
  
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semesterId === currentSemesterId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
          <p className="text-slate-500">{currentSemester?.name}</p>
        </div>
        <Button variant="primary">
          <Plus size={18} /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesterProjects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{project.code}</span>
                {project.isPublished ? (
                  <span className="text-xs font-bold" style={{ color: COLORS.emerald }}>Published</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Draft</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{project.title}</h3>
            </div>
            
            <div className="pt-6 mt-4 border-t border-slate-100 flex gap-2">
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
        <button className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors group h-full min-h-[200px]">
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
      case 'due': return { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Due Date', border: 'border-pink-200' };
      case 'demo': return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Demo', border: 'border-blue-200' };
      case 'critique': return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Critique', border: 'border-purple-200' };
      case 'progress_check': return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Check-in', border: 'border-orange-200' };
      case 'lab_day': return { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Lab Day', border: 'border-slate-200' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-800', label: type, border: 'border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Schedule</h2>
        <p className="text-slate-500">Timeline for {currentSemester?.name}</p>
      </div>

      {/* Quick Add Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Clock size={16} /> Quick Add Event
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input 
            type="date" 
            value={newItemDate}
            onChange={(e) => setNewItemDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500"
            required
          />
          <select 
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as any)}
            className="border border-slate-300 rounded px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500"
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
            className="border border-slate-300 rounded px-3 py-2 text-sm text-slate-600 bg-white flex-1 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
            required
          />
          <Button variant="primary" className="whitespace-nowrap">
            <Plus size={16} /> Add to Schedule
          </Button>
        </form>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {semesterItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No items scheduled yet. Add one above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {semesterItems.map(item => {
              const style = getTypeStyle(item.type);
              const dateObj = new Date(item.date);
              
              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 transition-colors">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-16 text-center border-r border-slate-100 pr-4 md:pr-0 md:border-r-0 md:w-24">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-xl font-bold text-slate-800">
                      {dateObj.getDate()}
                    </div>
                    <div className="text-xs text-slate-400">
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
                     <div className="font-bold text-slate-800">{item.title}</div>
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
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: COLORS.pacificCyan }}>
        <h2 className="text-xl font-bold text-slate-800">Hello, Alex.</h2>
        <p className="text-slate-500">
           {currentSemester ? `Welcome to ${currentSemester.name}.` : "No active semester selected."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Up Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 font-bold flex items-center gap-2 text-white" style={{ backgroundColor: COLORS.vintageGrape }}>
            <AlertCircle size={20} />
            Next Up
          </div>
          <div className="p-4 space-y-4">
             {upcomingItems.length > 0 ? upcomingItems.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 border-l-4 border-slate-300 rounded text-sm flex justify-between items-center">
                   <div>
                     <div className="font-bold text-slate-800">{item.title}</div>
                     <div className="text-slate-600 text-xs uppercase font-bold tracking-wide">{item.type.replace('_', ' ')}</div>
                   </div>
                   <div className="text-slate-500 text-xs text-right">
                     {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </div>
                </div>
             )) : (
               <div className="text-slate-400 text-center py-4">No upcoming items.</div>
             )}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 font-bold border-b border-slate-100 text-slate-800">
            Quick Actions
          </div>
          <div className="p-6 flex flex-col gap-3">
            <p className="text-sm text-slate-500 mb-2">Upload photos from your phone directly to your project log.</p>
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
       <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: COLORS.dustyGrape }}>
        <h2 className="text-xl font-bold text-slate-800">Semester Overview</h2>
        {currentSemester ? (
           <p className="text-slate-500">{currentSemester.name} • {semesterProjects.length} Projects Active</p>
        ) : (
           <p className="text-slate-500">No active semester selected.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        {[
          { label: 'Pending Reviews', val: '8', color: COLORS.emerald },
          { label: 'Overdue Students', val: '3', color: COLORS.vintageGrape },
          { label: 'Days Until Critique', val: '12', color: COLORS.pacificCyan },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.val}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </div>
            <div className="h-10 w-1 rounded-full bg-slate-100"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- App Shell Components ---

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed w-full z-20 top-0 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
            JDBB
          </div>
          <span className="font-bold text-lg hidden md:block" style={{ color: COLORS.dustyGrape }}>Project Tracker</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-700">{user.name}</span>
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
      <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out z-30 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        
        <nav className="p-4 space-y-1 flex-1">
          {allowedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); close(); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors group ${
                currentView === item.id ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} style={{ color: currentView === item.id ? COLORS.emerald : COLORS.pacificCyan }} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Semester Context Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
           <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current Semester</div>
           {currentSemester ? (
             <>
               <div className="font-medium text-slate-800 text-sm truncate" title={currentSemester.name}>{currentSemester.name}</div>
               <div className="text-xs text-slate-500 truncate">{currentSemester.courseCode}</div>
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
      default:
        return user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
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
    <AuthProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </AuthProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);