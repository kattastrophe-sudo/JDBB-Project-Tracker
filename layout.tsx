import React from 'react';
import { useAuth, useTheme, useData } from './data';
import { COLORS, ROLES } from './config';
import { Layout, Tag, Calendar, BarChart3, Users, Shield, Settings, Menu, Sun, Moon, LogOut } from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // Format role string (e.g. "admin_technologist" -> "Admin Technologist")
  const displayRole = user.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const isStudent = user.role === ROLES.STUDENT;

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
        <div className="hidden md:flex flex-col items-end"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span><span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full text-white font-bold shadow-sm" style={{ backgroundColor: isStudent ? COLORS.pacificCyan : COLORS.dustyGrape }}>{displayRole}</span></div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sign Out"><LogOut size={20} /></button>
      </div>
    </header>
  );
};

export const Sidebar = ({ isOpen, close, currentView, setView }) => {
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
