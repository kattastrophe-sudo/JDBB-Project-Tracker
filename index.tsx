import React, { useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { User, Shield, Users, Calendar, Layout, LogOut, Menu, CheckCircle, AlertCircle } from 'lucide-react';

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

// --- Mock Auth Context (MVP Step 2) ---

const AuthContext = createContext(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  const login = (role) => {
    // Simulating user data based on role
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
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm";
  const widthClass = fullWidth ? "w-full" : "";
  
  // Design System Mapping
  const styles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: COLORS.emerald, color: 'white' }, // Primary Actions
    secondary: { backgroundColor: COLORS.dustyGrape, color: 'white' }, // Structural Actions
    outline: { border: `2px solid ${COLORS.pacificCyan}`, color: COLORS.pacificCyan, backgroundColor: 'transparent' }, // Info/Neutral
    danger: { backgroundColor: COLORS.vintageGrape, color: 'white' }, // Alerts
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

// --- Login Screen (Simulation) ---

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

const Sidebar = ({ isOpen, close }) => {
  const { user } = useAuth();
  
  // Menu configuration based on permissions matrix
  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: Layout, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] 
    },
    { 
      label: 'Projects', 
      icon: Calendar, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR, ROLES.STUDENT] 
    },
    { 
      label: 'Student Progress', 
      icon: Users, 
      roles: [ROLES.ADMIN_TECH, ROLES.ADMIN_INSTRUCTOR, ROLES.MONITOR] 
    },
    { 
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
              key={item.label}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900 group"
            >
              <item.icon size={20} style={{ color: COLORS.pacificCyan }} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Semester Context Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
           <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current Semester</div>
           <div className="font-medium text-slate-800 text-sm">Winter 2026</div>
           <div className="text-xs text-slate-500 truncate">Modelmaking & Casting</div>
        </div>
      </aside>
    </>
  );
};

// --- View Content ---

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: COLORS.pacificCyan }}>
        <h2 className="text-xl font-bold text-slate-800">Hello, Alex.</h2>
        <p className="text-slate-500">Welcome to Week 4. You have 2 items upcoming.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Up Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 font-bold flex items-center gap-2 text-white" style={{ backgroundColor: COLORS.vintageGrape }}>
            <AlertCircle size={20} />
            Next Up / Overdue
          </div>
          <div className="p-4 space-y-4">
             <div className="p-3 bg-red-50 border-l-4 border-red-200 rounded text-sm">
                <div className="font-bold text-red-800">P1 Check-in #2</div>
                <div className="text-red-600">Due Yesterday</div>
             </div>
             <div className="p-3 bg-slate-50 border-l-4 border-slate-300 rounded text-sm">
                <div className="font-bold text-slate-800">P2 Demo Day</div>
                <div className="text-slate-600">Tomorrow, 10:00 AM</div>
             </div>
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
  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: COLORS.dustyGrape }}>
        <h2 className="text-xl font-bold text-slate-800">Semester Overview</h2>
        <p className="text-slate-500">Winter 2026 • 24 Students Enrolled</p>
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

// --- Main App Shell Integration ---

const AppShell = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} close={() => setSidebarOpen(false)} />
      
      <main className="pt-16 lg:pl-64 min-h-screen transition-all duration-200">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {user.role === ROLES.STUDENT ? <StudentDashboard /> : <AdminDashboard />}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);