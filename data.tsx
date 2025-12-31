import React, { useState, createContext, useContext, useEffect } from 'react';

// --- JDBB Design System & Constants ---

export const COLORS = {
  limeCream: '#BCE784',   // Success, Review, Positive
  emerald: '#5DD39E',     // Primary Action, Active
  pacificCyan: '#348AA7', // Info, Timeline, Neutral
  dustyGrape: '#525174',  // Secondary, Admin Structure
  vintageGrape: '#513B56',// Alerts, Overdue, Emphasis
  white: '#FFFFFF',
  textMain: '#1E293B',    // Slate 800
  textLight: '#64748B',   // Slate 500
};

export const ROLES = {
  ADMIN_TECH: 'Admin Technologist',
  ADMIN_INSTRUCTOR: 'Admin Instructor',
  MONITOR: 'Monitor',
  STUDENT: 'Student',
};

// --- Mock Data ---

const initialSemesters = [
  { id: 'sem-1', name: 'Winter 2026 – Modelmaking & Casting', courseCode: 'JJEW-100', isActive: true, startDate: '2026-01-08' },
  { id: 'sem-2', name: 'Fall 2025 – Fabrication 1', courseCode: 'JJEW-100', isActive: false, startDate: '2025-09-05' },
];

const initialProjects = [
  { id: 'p-1', semesterId: 'sem-1', code: 'P1', title: 'Orthographic Rendering', isPublished: true, description: 'Create 3 views of a simple ring design using standard drafting techniques.' },
  { id: 'p-2', semesterId: 'sem-1', code: 'P2', title: 'Wax Carving Basics', isPublished: true, description: 'Carve a signet ring from green wax tube.' },
  { id: 'p-3', semesterId: 'sem-1', code: 'P3', title: 'Lost Wax Casting', isPublished: false },
];

const initialSchedule = [
  { id: 's-1', semesterId: 'sem-1', projectId: 'p-1', title: 'P1 Due Date', date: '2026-02-01', type: 'due' },
  { id: 's-2', semesterId: 'sem-1', projectId: 'p-2', title: 'P2 Demo Day', date: '2026-02-03', type: 'demo' },
  { id: 's-3', semesterId: 'sem-1', projectId: 'p-1', title: 'P1 Rough Draft Check', date: '2026-01-20', type: 'progress_check' },
];

const initialProfiles = [
  { id: 'u-1', email: 'alex@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Alex Student' },
  { id: 'u-2', email: 'sam@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Sam Jeweler' },
  { id: 'u-3', email: 'casey@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Casey Caster' },
  { id: 'u-4', email: 'jordan@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Jordan Gem' },
  { id: 'u-5', email: 'taylor@student.jdbb.edu', role: ROLES.STUDENT, fullName: 'Taylor Tool' },
];

const initialEnrollments = [
  { id: 'e-1', profileId: 'u-1', semesterId: 'sem-1', studentNumber: 'S1000001', tagNumber: '04', status: 'active' },
  { id: 'e-2', profileId: 'u-2', semesterId: 'sem-1', studentNumber: 'S1000002', tagNumber: '12', status: 'active' },
  { id: 'e-3', profileId: 'u-3', semesterId: 'sem-1', studentNumber: 'S1000003', tagNumber: '01', status: 'active' },
  { id: 'e-4', profileId: 'u-4', semesterId: 'sem-1', studentNumber: 'S1000004', tagNumber: '15', status: 'active' },
  { id: 'e-5', profileId: 'u-5', semesterId: 'sem-1', studentNumber: 'S1000005', tagNumber: '08', status: 'active' },
];

const initialCheckIns = [
  { id: 'c-1', projectId: 'p-1', studentId: 'u-1', date: '2026-01-18T10:00:00', type: 'progress', content: 'Started the top view, struggling with the shank thickness.' },
];

const initialProjectStates = [
  { id: 'ps-1', projectId: 'p-1', studentId: 'u-1', status: 'in_progress', lastActivity: '2026-01-18' },
  { id: 'ps-2', projectId: 'p-1', studentId: 'u-2', status: 'submitted', lastActivity: '2026-01-19' },
  { id: 'ps-3', projectId: 'p-1', studentId: 'u-3', status: 'reviewed', lastActivity: '2026-01-20' },
  { id: 'ps-4', projectId: 'p-1', studentId: 'u-4', status: 'not_started', lastActivity: '2026-01-15' },
  { id: 'ps-5', projectId: 'p-2', studentId: 'u-3', status: 'in_progress', lastActivity: '2026-01-21' },
];

const initialNotificationLogs = [
  { id: 'n-1', date: '2026-01-30T08:00:00', recipient: 'alex@student.jdbb.edu', type: 'Reminder', subject: 'P1 Due in 2 days', status: 'Sent' },
  { id: 'n-2', date: '2026-01-30T08:00:00', recipient: 'sam@student.jdbb.edu', type: 'Reminder', subject: 'P1 Due in 2 days', status: 'Sent' },
  { id: 'n-3', date: '2026-01-28T08:00:00', recipient: 'jordan@student.jdbb.edu', type: 'Alert', subject: 'Missed Progress Check', status: 'Failed' },
];

// --- Contexts ---

export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  const toggleTheme = () => setIsDark(!isDark);
  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [semesters, setSemesters] = useState(initialSemesters);
  const [projects, setProjects] = useState(initialProjects);
  const [scheduleItems, setScheduleItems] = useState(initialSchedule);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [projectStates, setProjectStates] = useState(initialProjectStates);
  const [notificationLogs, setNotificationLogs] = useState(initialNotificationLogs);
  const [currentSemesterId, setCurrentSemesterId] = useState('sem-1');

  const addSemester = (sem) => setSemesters([...semesters, { ...sem, id: `sem-${Date.now()}` }]);
  const toggleSemesterStatus = (id) => setSemesters(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  const addProject = (project) => setProjects([...projects, { ...project, id: `p-${Date.now()}` }]);
  const addScheduleItem = (item) => setScheduleItems([...scheduleItems, { ...item, id: `s-${Date.now()}` }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  
  const addStudentToSemester = (studentData, semesterId) => {
    const newProfileId = `u-${Date.now()}`;
    setProfiles([...profiles, { id: newProfileId, fullName: studentData.name, email: studentData.email, role: ROLES.STUDENT }]);
    setEnrollments([...enrollments, { id: `e-${Date.now()}`, profileId: newProfileId, semesterId, studentNumber: studentData.studentNumber, tagNumber: studentData.tagNumber, status: 'active' }]);
  };

  const removeStudentFromSemester = (enrollmentId) => setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
  
  const addCheckIn = (checkIn) => {
    setCheckIns([{ ...checkIn, id: `c-${Date.now()}` }, ...checkIns]);
    if (checkIn.type !== 'instructor_comment') updateProjectStatus(checkIn.projectId, checkIn.studentId, 'in_progress');
  };

  const updateProjectStatus = (projectId, studentId, status) => {
    setProjectStates(prev => {
      const existing = prev.find(p => p.projectId === projectId && p.studentId === studentId);
      if (existing) return prev.map(p => p.id === existing.id ? { ...p, status, lastActivity: new Date().toISOString() } : p);
      return [...prev, { id: `ps-${Date.now()}`, projectId, studentId, status, lastActivity: new Date().toISOString() }];
    });
  };

  const updateInstructorNotes = (projectId, studentId, notes) => {
    setProjectStates(prev => {
      const existing = prev.find(p => p.projectId === projectId && p.studentId === studentId);
      if (existing) return prev.map(p => p.id === existing.id ? { ...p, instructorNotes: notes } : p);
      return [...prev, { id: `ps-${Date.now()}`, projectId, studentId, status: 'not_started', lastActivity: new Date().toISOString(), instructorNotes: notes }];
    });
  };

  const runDailyReminders = () => {
    const newLogs = []; // Mock logic simplified
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

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = (role) => setUser({
      id: role === ROLES.STUDENT ? 'u-1' : 'u-admin',
      name: role === ROLES.STUDENT ? 'Alex Student (Tag 04)' : `JDBB Staff (${role})`,
      role: role,
      email: 'user@jdbb.college.edu'
    });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// --- Hooks ---
export const useData = () => useContext(DataContext);
export const useAuth = () => useContext(AuthContext);
export const useTheme = () => useContext(ThemeContext);
