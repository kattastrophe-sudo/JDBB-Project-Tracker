import React, { useState, createContext, useContext, useEffect } from 'react';
import { supabase, ROLES, isSupabaseConfigured } from './config';

// --- Contexts ---

export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
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

  // Auto-link pending enrollments when a user logs in
  const linkPendingEnrollments = async (email, userId) => {
    if (!supabase) return;
    const { data: pending } = await supabase.from('enrollments').select('id').eq('email', email).is('profile_id', null);
    
    if (pending && pending.length > 0) {
       await supabase.from('enrollments').update({ profile_id: userId }).in('id', pending.map(p => p.id));
       const { data: refreshed } = await supabase.from('enrollments').select('*');
       if (refreshed) setEnrollments(refreshed);
    }
  };

  useEffect(() => {
    if (user && supabase) {
        linkPendingEnrollments(user.email, user.id);
    }
  }, [user]);

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
    if (error) {
       console.error("Add Semester Error:", error);
       alert("Failed to add semester. If you are an admin, check Settings > Developer Tools to fix permissions.");
    }
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
    const { data, error } = await supabase.from('projects').insert([dbProject]).select();
    if (error) {
       console.error("Add Project Error:", error);
       alert("Failed to add project. " + (error.code === '42501' ? "Permission denied." : error.message));
    }
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
    const { data, error } = await supabase.from('schedule_items').insert([dbItem]).select();
    if (error) {
       console.error("Add Schedule Item Error:", error);
       alert("Failed to add item. " + (error.code === '42501' ? "Permission denied." : error.message));
    }
    if (data) setScheduleItems(prev => [...prev, data[0]].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };
  
  const addStudentToSemester = async (studentData, semesterId) => {
     if (!supabase) return { success: false, error: 'Database not connected' };
     
     try {
         const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', studentData.email)
            .maybeSingle();
         
         if (!profileData) {
             return { 
                 success: false, 
                 error: "Account not found. The student must Sign Up for an account before they can be enrolled." 
             };
         }
         
         const enrollmentPayload = {
             profile_id: profileData.id, 
             email: studentData.email,
             semester_id: semesterId,
             student_number: studentData.studentNumber,
             tag_number: studentData.tagNumber,
             status: 'active'
         };

         const { data, error } = await supabase.from('enrollments').insert([enrollmentPayload]).select();

         if (error) {
             let errorMessage = error.message || "Unknown database error";
             const details = error.details || '';
             
             if (error.code === '23505') {
                if (errorMessage.includes('tag_number') || details.includes('tag_number')) errorMessage = `Tag Number #${studentData.tagNumber} is already taken in this semester.`;
                else if (errorMessage.includes('student_number') || details.includes('student_number')) errorMessage = `Student Number ${studentData.studentNumber} is already enrolled.`;
                else if (errorMessage.includes('email') || details.includes('email')) errorMessage = `Email ${studentData.email} is already enrolled.`;
                else errorMessage = "Duplicate entry found. This student or tag number is already enrolled.";
             }
             else if (error.code === '42501') {
                 console.warn("RLS Permission Error caught in addStudentToSemester.");
                 errorMessage = "Permission Denied: Your database role is likely set to 'Student'. Please go to Settings > Developer Tools to fix your permissions.";
             } else {
                 console.error("Add student error details:", JSON.stringify(error, null, 2));
             }
             
             return { success: false, error: errorMessage };
         }

         if (data) {
             setEnrollments(prev => [...prev, data[0]]);
             return { success: true };
         }
         return { success: false, error: 'Unknown error occurred (No data returned)' };
     } catch (err: any) {
         console.error("Unexpected error adding student:", err);
         const msg = err?.message || (typeof err === 'string' ? err : 'Unexpected error occurred');
         return { success: false, error: msg };
     }
  };

  const joinSemester = async (courseCode, studentNumber) => {
      if (!supabase || !user) return { success: false, error: "Not logged in" };
      try {
          const { data: semester } = await supabase.from('semesters').select('id, name').eq('course_code', courseCode).eq('is_active', true).single();
          if (!semester) return { success: false, error: "Invalid or inactive Course Code." };
          
          const { data: existing } = await supabase.from('enrollments').select('id').eq('semester_id', semester.id).eq('profile_id', user.id).maybeSingle();
          if (existing) return { success: false, error: "You are already enrolled in this semester." };
          
          const { data, error } = await supabase.from('enrollments').insert([{
              profile_id: user.id,
              email: user.email,
              semester_id: semester.id,
              student_number: studentNumber,
              tag_number: '00',
              status: 'active'
          }]).select();

          if (error) throw error;
          
          setEnrollments(prev => [...prev, data[0]]);
          setCurrentSemesterId(semester.id);
          return { success: true, semesterName: semester.name };

      } catch (e: any) {
          console.error("Join error:", e);
          return { success: false, error: e.message || "Failed to join semester." };
      }
  };

  const removeStudentFromSemester = async (enrollmentId) => {
    if (!supabase) return;
    await supabase.from('enrollments').delete().eq('id', enrollmentId);
    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
  };
  
  const updateProfileRole = async (userId, newRole) => {
    if (!supabase) return { success: false, error: "No connection" };
    try {
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (error) {
             if (error.code === '42501') {
                 return { success: false, error: "Permission Denied: You are not authorized to change user roles. Check Settings > Developer Tools." };
             }
             throw error;
        }
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to update role" };
    }
  };
  
  const addCheckIn = async (checkIn) => {
    if (!supabase) return;
    const dbCheckIn = {
      project_id: checkIn.projectId,
      student_id: checkIn.studentId,
      type: checkIn.type,
      content: checkIn.content,
      image_url: checkIn.imageMockUrl // Now receives actual URL if uploaded
    };
    const { data } = await supabase.from('check_ins').insert([dbCheckIn]).select();
    if (data) {
        setCheckIns(prev => [data[0], ...prev]);
        if (checkIn.type !== 'instructor_comment') {
            updateProjectStatus(checkIn.projectId, checkIn.studentId, 'in_progress');
        }
    }
  };
  
  // NEW: Upload File Function
  const uploadFile = async (file) => {
      if (!supabase) return { success: false, error: 'No connection' };
      const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      
      try {
          // Attempt to upload to 'checkins' bucket
          const { data, error } = await supabase.storage.from('checkins').upload(fileName, file);
          
          if (error) {
              // Graceful fallback for MVP if bucket doesn't exist or permissions bad
              console.error("Upload error:", error);
              return { success: false, error: "Upload failed. Ensure a public bucket named 'checkins' exists." };
          }
          
          const { data: { publicUrl } } = supabase.storage.from('checkins').getPublicUrl(fileName);
          return { success: true, url: publicUrl };
          
      } catch (e: any) {
          return { success: false, error: e.message };
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
  
  // NEW: Report Generator
  const exportRosterToCSV = () => {
    if (!currentSemesterId) return;
    
    // Header
    const headers = ['Tag', 'Student #', 'Name', 'Email', 'Status', ...projects.filter(p=>p.semester_id === currentSemesterId).map(p=>p.code)];
    
    // Rows
    const rows = enrollments
        .filter(e => e.semester_id === currentSemesterId)
        .sort((a,b) => parseInt(a.tag_number || '0') - parseInt(b.tag_number || '0'))
        .map(e => {
            const profile = profiles.find(p => p.id === e.profile_id);
            const projectStatuses = projects
                .filter(p=>p.semester_id === currentSemesterId)
                .map(p => {
                   const s = projectStates.find(ps => ps.project_id === p.id && ps.student_id === e.profile_id);
                   return s ? s.status : 'not_started';
                });
                
            return [
                e.tag_number || '00',
                e.student_number || 'N/A',
                `"${profile?.full_name || 'Pending'}"`,
                e.email,
                e.status,
                ...projectStatuses
            ];
        });
        
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DataContext.Provider value={{ 
      semesters, projects, scheduleItems, profiles, enrollments, checkIns, projectStates, notificationLogs, loading,
      currentSemesterId, setCurrentSemesterId, addSemester, toggleSemesterStatus, addProject, addScheduleItem,
      addStudentToSemester, joinSemester, removeStudentFromSemester, updateProfileRole, addCheckIn, updateProjectStatus, updateInstructorNotes,
      runDailyReminders, uploadFile, exportRosterToCSV
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
          setUser({
            id: authUser.id,
            email: authUser.email,
            role: ROLES.ADMIN_TECH, 
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
