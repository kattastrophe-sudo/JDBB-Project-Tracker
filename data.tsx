import React, { useState, createContext, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIGURATION ---
// We check LocalStorage first to allow UI-based configuration, then fall back to code constants.
const STORED_URL = localStorage.getItem('jdbb_supabase_url');
const STORED_KEY = localStorage.getItem('jdbb_supabase_key');

const CODE_URL = 'INSERT_YOUR_SUPABASE_URL_HERE';
const CODE_KEY = 'INSERT_YOUR_SUPABASE_ANON_KEY_HERE';

// Helper to validate URL format
const isValidUrl = (urlString) => {
  try { 
    return Boolean(new URL(urlString)); 
  } catch(e) { 
    return false; 
  }
};

const activeUrl = isValidUrl(STORED_URL) ? STORED_URL : (isValidUrl(CODE_URL) ? CODE_URL : null);
const activeKey = STORED_KEY || (CODE_KEY !== 'INSERT_YOUR_SUPABASE_ANON_KEY_HERE' ? CODE_KEY : null);

export const isSupabaseConfigured = Boolean(activeUrl && activeKey);

// Safely initialize client. If not configured, this remains null but doesn't crash the app.
export const supabase = isSupabaseConfigured ? createClient(activeUrl, activeKey) : null;

export const saveConfiguration = (url, key) => {
  localStorage.setItem('jdbb_supabase_url', url);
  localStorage.setItem('jdbb_supabase_key', key);
  window.location.reload();
};

export const clearConfiguration = () => {
  localStorage.removeItem('jdbb_supabase_url');
  localStorage.removeItem('jdbb_supabase_key');
  window.location.reload();
};

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

// Updated to match Database Enums
export const ROLES = {
  ADMIN_TECH: 'admin_technologist',
  ADMIN_INSTRUCTOR: 'admin_instructor',
  MONITOR: 'monitor',
  STUDENT: 'student',
};

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [projects, setProjects] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [projectStates, setProjectStates] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]); 
  const [currentSemesterId, setCurrentSemesterId] = useState(null);

  // Fetch Data when User logs in
  useEffect(() => {
    if (!user || !supabase) {
      setSemesters([]);
      setProjects([]);
      setScheduleItems([]);
      setProfiles([]);
      setEnrollments([]);
      setCheckIns([]);
      setProjectStates([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel fetching
        const [
          semestersRes, 
          projectsRes, 
          scheduleRes, 
          profilesRes, 
          enrollmentsRes, 
          checkInsRes,
          projectStatesRes
        ] = await Promise.all([
          supabase.from('semesters').select('*').order('start_date', { ascending: false }),
          supabase.from('projects').select('*').order('sequence_order', { ascending: true }),
          supabase.from('schedule_items').select('*').order('date', { ascending: true }),
          supabase.from('profiles').select('*'),
          supabase.from('enrollments').select('*'),
          supabase.from('check_ins').select('*').order('created_at', { ascending: false }),
          supabase.from('project_states').select('*')
        ]);

        if (semestersRes.data) {
            setSemesters(semestersRes.data);
            const activeSem = semestersRes.data.find(s => s.is_active);
            if (activeSem) setCurrentSemesterId(activeSem.id);
            else if (semestersRes.data.length > 0) setCurrentSemesterId(semestersRes.data[0].id);
        }
        if (projectsRes.data) setProjects(projectsRes.data);
        if (scheduleRes.data) setScheduleItems(scheduleRes.data);
        if (profilesRes.data) setProfiles(profilesRes.data);
        if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
        if (checkInsRes.data) setCheckIns(checkInsRes.data);
        if (projectStatesRes.data) setProjectStates(projectStatesRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up Realtime Subscriptions
    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, (payload) => {
        if(payload.eventType === 'INSERT') setCheckIns(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_states' }, (payload) => {
         supabase.from('project_states').select('*').then(res => { if(res.data) setProjectStates(res.data); });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };

  }, [user]);

  // --- ACTIONS ---

  const addSemester = async (sem) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('semesters').insert([sem]).select();
    if (data) setSemesters(prev => [...prev, data[0]]);
  };

  const toggleSemesterStatus = async (id) => {
    if (!supabase) return;
    const sem = semesters.find(s => s.id === id);
    if (!sem) return;
    const { data } = await supabase.from('semesters').update({ is_active: !sem.is_active }).eq('id', id).select();
    if (data) setSemesters(prev => prev.map(s => s.id === id ? data[0] : s));
  };

  const addProject = async (project) => {
    if (!supabase) return;
    const dbProject = {
      semester_id: project.semesterId,
      code: project.code,
      title: project.title,
      description: project.description,
      is_published: project.isPublished
    };
    const { data } = await supabase.from('projects').insert([dbProject]).select();
    if (data) setProjects(prev => [...prev, data[0]]);
  };

  const addScheduleItem = async (item) => {
    if (!supabase) return;
    const dbItem = {
      semester_id: item.semesterId,
      title: item.title,
      date: item.date,
      type: item.type
    };
    const { data } = await supabase.from('schedule_items').insert([dbItem]).select();
    if (data) setScheduleItems(prev => [...prev, data[0]].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };
  
  const addStudentToSemester = async (studentData, semesterId) => {
     if (!supabase) return;
     // Try to find profile by email
     const { data: profileData } = await supabase.from('profiles').select('id').eq('email', studentData.email).single();
     
     if (!profileData) {
         // This is where we handle the "Not Registered" case
         alert(`Cannot add ${studentData.email}. The student must Create an Account first, then you can add them to the roster.`);
         return;
     }

     const { data } = await supabase.from('enrollments').insert([{
         profile_id: profileData.id,
         semester_id: semesterId,
         student_number: studentData.studentNumber,
         tag_number: studentData.tagNumber,
         status: 'active'
     }]).select();

     if (data) {
         setEnrollments(prev => [...prev, data[0]]);
         const { data: p } = await supabase.from('profiles').select('*');
         if(p) setProfiles(p);
     }
  };

  const removeStudentFromSemester = async (enrollmentId) => {
    if (!supabase) return;
    await supabase.from('enrollments').delete().eq('id', enrollmentId);
    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
  };
  
  const addCheckIn = async (checkIn) => {
    if (!supabase) return;
    const dbCheckIn = {
      project_id: checkIn.projectId,
      student_id: checkIn.studentId,
      type: checkIn.type,
      content: checkIn.content,
      image_url: checkIn.imageMockUrl
    };
    const { data } = await supabase.from('check_ins').insert([dbCheckIn]).select();
    if (data) {
        setCheckIns(prev => [data[0], ...prev]);
        if (checkIn.type !== 'instructor_comment') {
            updateProjectStatus(checkIn.projectId, checkIn.studentId, 'in_progress');
        }
    }
  };

  const updateProjectStatus = async (projectId, studentId, status) => {
    if (!supabase) return;
    const { data: existing } = await supabase.from('project_states').select('id').match({project_id: projectId, student_id: studentId}).single();
    
    if (existing) {
        const { data } = await supabase.from('project_states').update({ status, last_activity_at: new Date().toISOString() }).eq('id', existing.id).select();
        if (data) setProjectStates(prev => prev.map(p => p.id === existing.id ? data[0] : p));
    } else {
        const { data } = await supabase.from('project_states').insert([{
            project_id: projectId,
            student_id: studentId,
            status,
            last_activity_at: new Date().toISOString()
        }]).select();
        if (data) setProjectStates(prev => [...prev, data[0]]);
    }
  };

  const updateInstructorNotes = async (projectId, studentId, notes) => {
    if (!supabase) return;
    const { data: existing } = await supabase.from('project_states').select('id').match({project_id: projectId, student_id: studentId}).single();
    if (existing) {
        const { data } = await supabase.from('project_states').update({ instructor_notes: notes }).eq('id', existing.id).select();
         if (data) setProjectStates(prev => prev.map(p => p.id === existing.id ? data[0] : p));
    } else {
        const { data } = await supabase.from('project_states').insert([{
            project_id: projectId,
            student_id: studentId,
            instructor_notes: notes,
            last_activity_at: new Date().toISOString()
        }]).select();
        if (data) setProjectStates(prev => [...prev, data[0]]);
    }
  };

  const runDailyReminders = () => {
    setNotificationLogs(prev => prev);
  };

  return (
    <DataContext.Provider value={{ 
      semesters, projects, scheduleItems, profiles, enrollments, checkIns, projectStates, notificationLogs, loading,
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
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
      if (!supabase) return;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (data) {
          setUser({
              id: authUser.id,
              email: authUser.email,
              role: data.role,
              name: data.full_name || authUser.email
          });
      } else {
          // If profile missing, fallback (likely just created account)
          setUser({
            id: authUser.id,
            email: authUser.email,
            role: ROLES.STUDENT, 
            name: authUser.user_metadata?.full_name || authUser.email
          });
      }
  };

  const login = async (email, password) => {
      if (!supabase) throw new Error("Database not connected");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
  };

  const signUp = async (email, password, fullName) => {
      if (!supabase) throw new Error("Database not connected");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      return data;
  };

  const logout = async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ user, login, logout, signUp }}>{children}</AuthContext.Provider>;
};

// --- Hooks ---
export const useData = () => useContext(DataContext);
export const useAuth = () => useContext(AuthContext);
export const useTheme = () => useContext(ThemeContext);
