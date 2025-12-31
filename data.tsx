import React, { useState, createContext, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIGURATION ---
// TODO: Replace these with your actual values from Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'INSERT_YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'INSERT_YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const [notificationLogs, setNotificationLogs] = useState([]); // Still local for now
  const [currentSemesterId, setCurrentSemesterId] = useState(null);

  // Fetch Data when User logs in
  useEffect(() => {
    if (!user) {
      // Clear data on logout
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

    // Set up Realtime Subscriptions (Optional for MVP, but good for updates)
    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, (payload) => {
        if(payload.eventType === 'INSERT') setCheckIns(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_states' }, (payload) => {
         // Re-fetch strictly to ensure consistency or handle local merge
         supabase.from('project_states').select('*').then(res => { if(res.data) setProjectStates(res.data); });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };

  }, [user]);

  // --- ACTIONS ---

  const addSemester = async (sem) => {
    const { data, error } = await supabase.from('semesters').insert([sem]).select();
    if (data) setSemesters(prev => [...prev, data[0]]);
  };

  const toggleSemesterStatus = async (id) => {
    const sem = semesters.find(s => s.id === id);
    if (!sem) return;
    const { data } = await supabase.from('semesters').update({ is_active: !sem.is_active }).eq('id', id).select();
    if (data) setSemesters(prev => prev.map(s => s.id === id ? data[0] : s));
  };

  const addProject = async (project) => {
    // Convert camelCase to snake_case for DB
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
     // NOTE: Creating a new user via API is tricky without Admin Auth client. 
     // For this MVP, we assume the Profile exists or we are just creating the Enrollment.
     // If Profile doesn't exist, this will fail. User should be created in Supabase Auth first.
     // However, we can check if profile exists by email.
     
     const { data: profileData } = await supabase.from('profiles').select('id').eq('email', studentData.email).single();
     
     if (!profileData) {
         alert("Error: This student email must register in the system first.");
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
         // Refresh profiles just in case
         const { data: p } = await supabase.from('profiles').select('*');
         if(p) setProfiles(p);
     }
  };

  const removeStudentFromSemester = async (enrollmentId) => {
    await supabase.from('enrollments').delete().eq('id', enrollmentId);
    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
  };
  
  const addCheckIn = async (checkIn) => {
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
    // Upsert logic
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
    // Mock for now
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
      // Fetch the custom profile (role, name) from 'profiles' table
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (data) {
          setUser({
              id: authUser.id,
              email: authUser.email,
              role: data.role,
              name: data.full_name || authUser.email
          });
      } else {
          // If profile doesn't exist yet (first login?), we might need to rely on basic info or create one
          // For safety, default to student role locally if not found, though DB RLS might block.
          console.warn("Profile not found for user", authUser.id);
          setUser({
            id: authUser.id,
            email: authUser.email,
            role: ROLES.STUDENT, // Fallback
            name: authUser.email
          });
      }
  };

  const login = async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
  };

  const logout = async () => {
      await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// --- Hooks ---
export const useData = () => useContext(DataContext);
export const useAuth = () => useContext(AuthContext);
export const useTheme = () => useContext(ThemeContext);
