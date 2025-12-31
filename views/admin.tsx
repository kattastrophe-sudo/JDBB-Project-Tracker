import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useData, useAuth } from '../data';
import { COLORS, ROLES, activeUrl, supabase } from '../config';
import { Button } from '../components';
import { Layout, Calendar, AlertTriangle, AlertCircle, Settings, User, Users, Shield, Plus, Play, Mail, UserPlus, Trash2, Download, CheckCircle, HelpCircle, Database, Key, FileText } from 'lucide-react';

export const AdminDashboard = () => {
  const { currentSemesterId, semesters, projects, checkIns, scheduleItems, exportRosterToCSV } = useData();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semester_id === currentSemesterId);
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
          <div className="flex gap-2"><Button variant="outline" onClick={exportRosterToCSV}><Download size={16} /> Report</Button><Button variant="primary"><Plus size={16} /> New Announcement</Button></div>
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
                     <div className="flex-1"><div className="flex justify-between items-start"><span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Student ID {ci.student_id ? ci.student_id.split('-')[0] : 'Unknown'}</span><span className="text-xs text-slate-400">{new Date(ci.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div><p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{ci.content}</p></div>
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

export const AdminSettings = () => {
  const { notificationLogs, runDailyReminders } = useData();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [realDbRole, setRealDbRole] = useState('Loading...');
  const [copied, setCopied] = useState(false);
  
  // Emergency Fix State
  const [serviceKey, setServiceKey] = useState('');
  const [fixLoading, setFixLoading] = useState(false);
  const [fixMsg, setFixMsg] = useState('');

  // DEBUG: Check what the database actually thinks I am
  useEffect(() => {
    if(user && supabase) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setRealDbRole(data ? data.role : 'Row Missing'))
        .catch(e => setRealDbRole('Error fetching'));
    }
  }, [user]);

  const handleRunReminders = () => { setIsRunning(true); setTimeout(() => { runDailyReminders(); setIsRunning(false); }, 1000); };
  
  const fixCommand = `UPDATE profiles SET role = 'admin_technologist' WHERE email = '${user.email}';
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'admin_technologist';`;

  const schemaFixCommand = `ALTER TABLE projects ADD COLUMN IF NOT EXISTS rubric_url text;`;

  // COMPREHENSIVE FIX FOR CHECK-IN DELETION AND LABELS
  const permissionsFixCommand = `-- 1. Ensure author_id column exists
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id);

-- 2. Drop existing DELETE policies to remove conflicts
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON check_ins;
DROP POLICY IF EXISTS "Enable delete for owners and admins" ON check_ins;

-- 3. Create a comprehensive DELETE policy
CREATE POLICY "Enable delete for owners and admins" ON check_ins FOR DELETE
USING (
  auth.uid() = author_id 
  OR (author_id IS NULL AND auth.uid() = student_id)
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin_technologist', 'admin_instructor')
  )
);

-- 4. Enable INSERT policy for author_id
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON check_ins;
CREATE POLICY "Enable insert for authenticated users only" ON check_ins FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // EMERGENCY FIX LOGIC
  const handleForceUpgrade = async () => {
    if (!serviceKey.startsWith('ey')) {
       setFixMsg('Invalid Key format.');
       return;
    }
    setFixLoading(true);
    try {
        const tempClient = createClient(activeUrl, serviceKey);
        
        const { error } = await tempClient.from('profiles').update({ role: ROLES.ADMIN_TECH }).eq('id', user.id);
        
        if (error) throw error;
        
        setFixMsg('SUCCESS! Role updated to admin_technologist. Refreshing...');
        setServiceKey('');
        setTimeout(() => window.location.reload(), 1500);
        
    } catch (e) {
        setFixMsg('Failed: ' + e.message);
    } finally {
        setFixLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Settings</h2><p className="text-slate-500 dark:text-slate-400">System configuration and notification logs.</p></div>
      
      {/* DEVELOPER TOOLS */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-lg border border-slate-700">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-400"><Database size={18} /> Developer Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono mb-6">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-500 text-xs uppercase mb-1">App UI Role (Local)</div>
                <div className="text-white font-bold">{user.role}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-500 text-xs uppercase mb-1">Database Row Role (Remote)</div>
                <div className={`${realDbRole === ROLES.ADMIN_TECH ? 'text-green-400' : 'text-red-400'} font-bold`}>
                    {realDbRole}
                </div>
            </div>
        </div>
        
        <div className="space-y-4">
             {realDbRole !== ROLES.ADMIN_TECH && (
                 <div className="bg-amber-900/30 border border-amber-900/50 p-4 rounded text-sm text-amber-200 mb-4">
                     <div className="font-bold flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Permission Mismatch Detected</div>
                     Your database thinks you are a <strong>{realDbRole}</strong>.
                 </div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <h4 className="font-bold text-emerald-400 mb-2">Fix: Set Admin Role</h4>
                    <div className="relative group mb-2">
                        <pre className="bg-black p-3 rounded text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">{fixCommand}</pre>
                        <button onClick={() => copyToClipboard(fixCommand)} className="absolute top-1 right-1 text-xs bg-slate-800 text-white px-2 py-1 rounded">Copy</button>
                    </div>
                 </div>
                 
                 <div className="bg-slate-900 p-4 rounded border border-slate-700 shadow-lg md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Trash2 size={16}/> Fix: Repair Delete Permissions</h4>
                    <p className="text-xs text-slate-300 mb-3">
                        If you cannot delete posts, run this SQL. It enables deletion for Admins and fixes issues where older posts can't be deleted by students.
                    </p>
                    <div className="relative group mb-2">
                        <pre className="bg-black p-3 rounded text-[10px] font-mono text-emerald-300 overflow-x-auto border border-slate-800 max-h-32">{permissionsFixCommand}</pre>
                        <button onClick={() => copyToClipboard(permissionsFixCommand)} className="absolute top-2 right-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-bold shadow-sm transition-colors">Copy SQL</button>
                    </div>
                 </div>

                 <div className="bg-slate-950 p-4 rounded border border-slate-800 md:col-span-2">
                    <h4 className="font-bold text-pink-400 mb-2">Emergency Key Upgrade</h4>
                    <p className="text-xs text-slate-400 mb-3">Paste your <code>service_role</code> key here to force-update your account now.</p>
                    <div className="flex gap-2">
                        <input type="password" value={serviceKey} onChange={e => setServiceKey(e.target.value)} placeholder="eyJh..." className="flex-1 bg-black border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-pink-500" />
                        <Button variant="danger" size="sm" onClick={handleForceUpgrade} disabled={fixLoading || !serviceKey} className="text-xs py-1 px-3">
                            {fixLoading ? 'Fixing...' : 'Fix'}
                        </Button>
                    </div>
                    {fixMsg && <div className="mt-2 text-xs font-bold text-white">{fixMsg}</div>}
                 </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6"><div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6"><div className="flex justify-between items-start mb-4"><h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Settings size={18} /> Configuration</h3><Button onClick={handleRunReminders} disabled={isRunning} variant="primary">{isRunning ? 'Sending...' : <><Play size={16} /> Run Daily Reminders</>}</Button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Timezone</div><div className="font-mono text-sm text-slate-800 dark:text-slate-200">America/Toronto</div></div></div></div><div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900"><h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Mail size={18} /> Notification Log</h3></div><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800"><tr><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Time</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Recipient</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{notificationLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-6 py-4 text-xs text-slate-500">{new Date(log.date).toLocaleTimeString()}</td><td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{log.recipient}</td><td className="px-6 py-4"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${log.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

export const RosterManager = ({ onSelectStudent }) => {
  const { profiles, enrollments, currentSemesterId, semesters, addStudentToSemester, removeStudentFromSemester, updateProfileRole } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const [viewMode, setViewMode] = useState('roster'); 
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newStudentNum, setNewStudentNum] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const isAdminTech = user.role === ROLES.ADMIN_TECH;

  const semesterEnrollments = useMemo(() => 
    enrollments.filter(e => e.semester_id === currentSemesterId)
    .sort((a, b) => parseInt(a.tag_number || '0') - parseInt(b.tag_number || '0')), 
  [enrollments, currentSemesterId]);

  const allUsers = useMemo(() => profiles.sort((a,b) => (a.full_name || a.email).localeCompare(b.full_name || b.email)), [profiles]);

  const handleAddStudent = async (e) => { 
      e.preventDefault(); 
      setIsSubmitting(true);
      setErrorMsg('');
      const result = await addStudentToSemester({ name: newName, email: newEmail, studentNumber: newStudentNum, tagNumber: newTag }, currentSemesterId); 
      setIsSubmitting(false);
      
      if (result && result.success) {
          setIsAdding(false); 
          setNewName(''); setNewEmail(''); setNewStudentNum(''); setNewTag(''); 
      } else {
          setErrorMsg(result.error || 'Failed to add student. Please check inputs.');
      }
  };

  const startEnrollment = (userProfile) => {
      setNewName(userProfile.full_name);
      setNewEmail(userProfile.email);
      setNewStudentNum('');
      setNewTag('');
      setIsAdding(true);
      setViewMode('roster');
      window.scrollTo(0,0);
  };
  
  const handleRoleChange = async (userId, newRole) => {
      const result = await updateProfileRole(userId, newRole);
      if (!result.success) {
          alert(result.error);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Roster</h2><p className="text-slate-500">Manage enrollments for {currentSemester?.name}</p></div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setViewMode('roster')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'roster' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Roster</button>
                <button onClick={() => setViewMode('directory')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'directory' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>User Directory</button>
            </div>
            {isAdminTech && <Button variant="primary" onClick={() => { setIsAdding(!isAdding); setErrorMsg(''); setNewName(''); setNewEmail(''); }}>{isAdding ? 'Cancel' : <><UserPlus size={18} /> Enroll Registered User</>}</Button>}
          </div>
      </div>

      {isAdding && isAdminTech && <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
        <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2"><UserPlus size={18}/> Enroll Student into {currentSemester?.name}</h3>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg flex items-start gap-2">
           <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
           <p><strong>Note:</strong> Students must sign up for an account first. If you see a "Permission Denied" error below, it means the database prevents Admins from enrolling others. Please ask the student to use the Course Code: <strong>{semesters.find(s=>s.id===currentSemesterId)?.courseCode || semesters.find(s=>s.id===currentSemesterId)?.course_code}</strong></p>
        </div>
        <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tag #</label><input type="text" maxLength={2} value={newTag} onChange={e => setNewTag(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-emerald-500 outline-none" required placeholder="01" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student #</label><input type="text" value={newStudentNum} onChange={e => setNewStudentNum(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-emerald-500 outline-none" required placeholder="1234567" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-emerald-500 outline-none" required placeholder="student@college.edu" /></div>
                <div className="md:col-span-1"><Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Confirm'}</Button></div>
            </div>
            {errorMsg && <div className="text-red-500 text-sm font-bold flex items-center gap-2 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg"><AlertCircle size={16} /> {errorMsg}</div>}
        </form>
      </div>}

      {viewMode === 'roster' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"><tr><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase w-24 text-center">Tag #</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Student</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>{isAdminTech && <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{semesterEnrollments.map((record) => { 
            const profile = profiles.find(p => p.id === record.profile_id);
            const isPending = !record.profile_id; 
            return (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-center cursor-pointer font-mono text-slate-600 dark:text-slate-300" onClick={() => !isPending && onSelectStudent && onSelectStudent(record.profile_id)}>{record.tag_number}</td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => !isPending && onSelectStudent && onSelectStudent(record.profile_id)}>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{profile?.full_name || <span className="text-slate-400 italic">No Account Created</span>}</div>
                        <div className="text-xs text-slate-500">{record.email || profile?.email}</div>
                    </td>
                    <td className="px-6 py-4">{isPending ? <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full inline-flex items-center gap-1"><HelpCircle size={10} /> Pending Sign Up</span> : <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full inline-flex items-center gap-1"><CheckCircle size={10} /> Active</span>}</td>
                    {isAdminTech && <td className="px-6 py-4 text-right"><button onClick={() => removeStudentFromSemester(record.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>}
                </tr>
            ); 
        })}</tbody></table></div>
      )}

      {viewMode === 'directory' && (
         <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                 All registered users in the system. Use this list to approve new accounts and assign roles.
             </div>
             <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">System Role</th>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {allUsers.map((profile) => {
                         const isEnrolled = semesterEnrollments.some(e => e.profile_id === profile.id);
                         return (
                             <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="px-6 py-4">
                                     <div className="font-bold text-slate-800 dark:text-slate-200">{profile.full_name}</div>
                                     <div className="text-xs text-slate-500">{profile.email}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <select 
                                        value={profile.role} 
                                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                        disabled={!isAdminTech}
                                        className="text-xs font-medium bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                     >
                                        <option value={ROLES.STUDENT}>Student</option>
                                        <option value={ROLES.MONITOR}>Monitor</option>
                                        <option value={ROLES.ADMIN_INSTRUCTOR}>Instructor</option>
                                        <option value={ROLES.ADMIN_TECH}>Technologist</option>
                                     </select>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     {isEnrolled ? (
                                         <span className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1"><CheckCircle size={14}/> Enrolled</span>
                                     ) : (
                                         <Button variant="outline" onClick={() => startEnrollment(profile)} className="text-xs h-8">Enroll</Button>
                                     )}
                                 </td>
                             </tr>
                         );
                     })}
                 </tbody>
             </table>
         </div>
      )}
    </div>
  );
};

export const SemesterManager = () => {
  const { semesters, addSemester, toggleSemesterStatus } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [newSemCode, setNewSemCode] = useState('');
  const [newSemStart, setNewSemStart] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(newSemName && newSemCode && newSemStart) {
        await addSemester({ name: newSemName, course_code: newSemCode, start_date: newSemStart, is_active: false });
        setIsAdding(false);
        setNewSemName(''); setNewSemCode(''); setNewSemStart('');
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Semesters</h2><p className="text-slate-500">Manage academic terms.</p></div>
            <Button variant="primary" onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancel' : <><Plus size={18}/> New Semester</>}</Button>
        </div>
        
        {isAdding && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label><input type="text" value={newSemName} onChange={e => setNewSemName(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="Winter 2025" required /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Code</label><input type="text" value={newSemCode} onChange={e => setNewSemCode(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="MAD9000" required /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label><input type="date" value={newSemStart} onChange={e => setNewSemStart(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div>
                    </div>
                    <Button type="submit" variant="primary">Create Semester</Button>
                </form>
            </div>
        )}

        <div className="grid gap-4">
            {semesters.map(sem => (
                <div key={sem.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-lg text-slate-800 dark:text-slate-100">{sem.name}</div>
                        <div className="text-sm text-slate-500">{sem.course_code} • Starts {new Date(sem.start_date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        {sem.is_active ? <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Active</span> : <span className="text-xs font-bold text-slate-400">Archived</span>}
                        <Button variant={sem.is_active ? "outline" : "primary"} onClick={() => toggleSemesterStatus(sem.id)} className="text-xs">{sem.is_active ? 'Deactivate' : 'Activate'}</Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};