import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useData, useAuth, COLORS, ROLES, supabase } from './data';
import { Button } from './components';
import { ArrowLeft, Clock, Layout, Calendar, AlertTriangle, AlertCircle, Settings, Camera, CheckCircle, Lock, FileText, Send, User, Users, Shield, Filter, X, Plus, Archive, Power, Play, Mail, UserPlus, Trash2, Download, HelpCircle, Edit, Database, Copy, Terminal, Key } from 'lucide-react';

export const StudentDashboard = () => {
  const { currentSemesterId, semesters, scheduleItems, projects, projectStates, joinSemester } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  
  // If no active semester, show Join UI
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [studentNum, setStudentNum] = useState('');
  
  const handleJoin = async (e) => {
      e.preventDefault();
      setJoinError('');
      if (!joinCode || !studentNum) return;
      const res = await joinSemester(joinCode, studentNum);
      if (!res.success) setJoinError(res.error);
      else window.location.reload(); // Quick refresh to load semester data
  };

  if (!currentSemesterId || !currentSemester) {
      return (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border-t-4" style={{ borderColor: COLORS.emerald }}>
                 <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 mx-auto"><Shield size={32} /></div>
                 <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">Join a Semester</h2>
                 <p className="text-center text-slate-500 mb-6">Enter the Course Code provided by your instructor to access your project dashboard.</p>
                 <form onSubmit={handleJoin} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Code</label>
                         <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} className="w-full text-center text-2xl font-mono font-bold tracking-widest p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 outline-none uppercase placeholder:text-slate-300" placeholder="ABC" maxLength={6} required />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Student #</label>
                         <input type="text" value={studentNum} onChange={e => setStudentNum(e.target.value)} className="w-full text-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 outline-none" placeholder="1234567" required />
                     </div>
                     {joinError && <div className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded text-center">{joinError}</div>}
                     <Button type="submit" variant="primary" fullWidth size="lg">Join Course</Button>
                 </form>
             </div>
          </div>
      );
  }

  const upcomingItems = scheduleItems.filter(s => s.semester_id === currentSemesterId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);
  const activeProject = projects.find(p => p.is_published) || projects[0];
  const activeProjectState = activeProject ? projectStates.find(ps => ps.project_id === activeProject.id && ps.student_id === user.id) : null;
  const status = activeProjectState?.status || 'not_started';

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div><div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div><h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user.name.split(' ')[0]}.</h2></div>
        <div className="text-right hidden md:block"><div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Current Semester</div><div className="text-lg font-bold text-emerald-500">{currentSemester?.name}</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-900 dark:to-teal-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700"><Layout size={120} /></div>
           <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-4"><Clock size={12} /> Current Focus</div>
             {activeProject ? (
               <><h3 className="text-3xl font-bold mb-2">{activeProject.title}</h3><p className="text-emerald-100 max-w-md mb-6">{activeProject.description || "Complete the required steps to submit your work for review."}</p>
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-lg">
                    <div className="flex justify-between items-center mb-2 text-sm font-bold"><span>Status: {status.replace('_', ' ')}</span><span>{status === 'submitted' ? '100%' : status === 'in_progress' ? '50%' : '0%'}</span></div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: status === 'submitted' ? '100%' : status === 'in_progress' ? '50%' : '5%' }}></div></div>
                 </div>
                 <div className="mt-6 flex gap-3"><Button className="bg-white text-emerald-900 hover:bg-emerald-50 border-none shadow-lg">Continue Work <ArrowLeft className="rotate-180" size={16} /></Button><Button variant="outline" className="text-white border-white/30 hover:bg-white/10">View Rubric</Button></div></>
             ) : (<p>No active projects.</p>)}
           </div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: COLORS.vintageGrape }}>
           <div className="absolute -bottom-4 -right-4 text-white/5"><AlertCircle size={100} /></div>
           <div><h4 className="text-white/70 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2"><AlertTriangle size={14} /> Critical Deadline</h4><div className="text-4xl font-bold mb-1">2 Days</div><div className="text-white/80 font-medium">Until P1 Submission</div></div>
           <div className="mt-8 pt-6 border-t border-white/10"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Calendar size={20} /></div><div><div className="text-sm font-bold">Feb 01, 2026</div><div className="text-xs text-white/60">Midnight EST</div></div></div></div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6"><h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Calendar size={20} className="text-slate-400" /> Upcoming Schedule</h3><button className="text-xs font-bold text-emerald-500 hover:text-emerald-600">View All</button></div>
           <div className="space-y-4">
              {upcomingItems.map(item => (
                <div key={item.id} className="flex items-center group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                   <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"><span className="text-xs font-bold uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span><span className="text-lg font-bold">{new Date(item.date).getDate()}</span></div>
                   <div className="ml-4 flex-1"><div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div><div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{item.type.replace('_', ' ')}</div></div>
                   <div className="px-4">{item.type === 'due' && <span className="text-xs font-bold text-white px-2 py-1 rounded bg-red-500">DUE</span>}</div>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><Settings size={20} className="text-slate-400" /> Quick Actions</h3>
           <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 border border-transparent transition-all group text-left"><div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Camera size={20} /></div><div><div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Post Check-in</div><div className="text-xs text-slate-500">Upload a photo</div></div></button>
              <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 border border-transparent transition-all group text-left"><div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Layout size={20} /></div><div><div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">View Timeline</div><div className="text-xs text-slate-500">P1 Full Schedule</div></div></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { currentSemesterId, semesters, projects, checkIns, scheduleItems } = useData();
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
          <div className="flex gap-2"><Button variant="outline"><Download size={16} /> Report</Button><Button variant="primary"><Plus size={16} /> New Announcement</Button></div>
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fixCommand);
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
        const storedUrl = localStorage.getItem('jdbb_supabase_url');
        const defaultUrl = 'https://yqptmvtlsjyuxtzaegun.supabase.co';
        
        // Create a temporary client with the service key
        const tempClient = createClient(storedUrl || defaultUrl, serviceKey);
        
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
        <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-400"><Database size={18} /> Developer Tools: Permissions Fix</h3>
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
        
        {realDbRole !== ROLES.ADMIN_TECH && (
          <div className="space-y-4">
             <div className="bg-amber-900/30 border border-amber-900/50 p-4 rounded text-sm text-amber-200">
                 <div className="font-bold flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Permission Mismatch Detected</div>
                 Your database thinks you are a <strong>{realDbRole}</strong>. You have two options to fix this:
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <h4 className="font-bold text-emerald-400 mb-2">Option A: Run SQL (Preferred)</h4>
                    <p className="text-xs text-slate-400 mb-3">Copy this command and run it in your Supabase SQL Editor.</p>
                    <div className="relative group mb-2">
                        <pre className="bg-black p-3 rounded text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">{fixCommand}</pre>
                        <button onClick={copyToClipboard} className="absolute top-1 right-1 text-xs bg-slate-800 text-white px-2 py-1 rounded">{copied ? 'Copied' : 'Copy'}</button>
                    </div>
                 </div>

                 <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <h4 className="font-bold text-pink-400 mb-2">Option B: Emergency Key</h4>
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
        )}
      </div>

      <div className="grid grid-cols-1 gap-6"><div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6"><div className="flex justify-between items-start mb-4"><h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Settings size={18} /> Configuration</h3><Button onClick={handleRunReminders} disabled={isRunning} variant="primary">{isRunning ? 'Sending...' : <><Play size={16} /> Run Daily Reminders</>}</Button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Timezone</div><div className="font-mono text-sm text-slate-800 dark:text-slate-200">America/Toronto</div></div></div></div><div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900"><h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Mail size={18} /> Notification Log</h3></div><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800"><tr><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Time</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Recipient</th><th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{notificationLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-6 py-4 text-xs text-slate-500">{new Date(log.date).toLocaleTimeString()}</td><td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{log.recipient}</td><td className="px-6 py-4"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${log.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

export const RosterManager = ({ onSelectStudent }) => {
  const { profiles, enrollments, currentSemesterId, semesters, addStudentToSemester, removeStudentFromSemester, updateProfileRole } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const [viewMode, setViewMode] = useState('roster'); // 'roster' or 'directory'
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
          alert(result.error); // Simple alert for now, can be improved
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

export const ProjectManager = ({ onSelectProject }) => {
  const { projects, currentSemesterId, semesters, projectStates, addProject } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterProjects = projects.filter(p => p.semester_id === currentSemesterId);
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const getStatus = (projectId) => (!user ? 'draft' : projectStates.find(s => s.project_id === projectId && s.student_id === user.id)?.status || 'not_started');
  const handleCreate = (e) => { e.preventDefault(); addProject({ semesterId: currentSemesterId, code: newCode, title: newTitle, description: newDesc, isPublished }); setIsCreating(false); setNewCode(''); setNewTitle(''); setNewDesc(''); };
  
  const isAdminTech = user.role === ROLES.ADMIN_TECH;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Projects</h2><p className="text-slate-500 dark:text-slate-400">{currentSemester?.name}</p></div>{isAdminTech && <Button variant="primary" onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : <><Plus size={18} /> New Project</>}</Button>}</div>
      {isCreating && isAdminTech && <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-900/50 mb-6"><form onSubmit={handleCreate} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code</label><input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div><div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label><textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" /></div><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} /> Publish immediately</label></div><div className="flex justify-end"><Button type="submit" variant="primary">Create</Button></div></form></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{semesterProjects.map(project => { const status = getStatus(project.id); return (<div key={project.id} onClick={() => onSelectProject && onSelectProject(project.id)} className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"><div className="space-y-4"><div className="flex justify-between items-start"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-300">{project.code}</span>{user.role !== ROLES.STUDENT ? (project.is_published ? <span className="text-xs font-bold text-emerald-500">Published</span> : <span className="text-xs font-bold text-slate-400">Draft</span>) : (<span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status === 'reviewed' ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-500'}`}>{status.replace('_', ' ')}</span>)}</div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{project.title}</h3></div></div>); })}</div>
    </div>
  );
};

export const ScheduleManager = () => {
  const { scheduleItems, currentSemesterId, semesters, addScheduleItem } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  const semesterItems = scheduleItems.filter(s => s.semester_id === currentSemesterId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('due');
  const handleAdd = (e) => { e.preventDefault(); addScheduleItem({ semesterId: currentSemesterId, title: newItemTitle, date: newItemDate, type: newItemType }); setNewItemTitle(''); };
  const getTypeStyle = (type) => { switch(type) { case 'due': return { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300', label: 'Due Date' }; case 'demo': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Demo' }; default: return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', label: type }; } };

  const isAdminTech = user.role === ROLES.ADMIN_TECH;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Schedule</h2><p className="text-slate-500 dark:text-slate-400">Timeline for {currentSemester?.name}</p></div>
      {isAdminTech && <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800"><form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3"><input type="date" value={newItemDate} onChange={(e) => setNewItemDate(e.target.value)} className="border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /><select value={newItemType} onChange={(e) => setNewItemType(e.target.value)} className="border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"><option value="due">Due Date</option><option value="demo">Demo Day</option><option value="progress_check">Progress Check</option></select><input type="text" placeholder="Event Title" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} className="border p-2 rounded text-sm flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" required /><Button type="submit" variant="primary"><Plus size={16} /> Add</Button></form></div>}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">{semesterItems.map(item => { const style = getTypeStyle(item.type); const dateObj = new Date(item.date); return (<div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"><div className="w-16 text-center"><div className="text-xs font-bold text-slate-400 uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div><div className="text-xl font-bold text-slate-800 dark:text-slate-100">{dateObj.getDate()}</div></div><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>{style.label}</span></div><div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div></div></div>); })}</div>
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

export const ProjectDetail = ({ projectId, targetStudentId, onBack }) => {
    const { projects, checkIns, addCheckIn, projectStates, updateInstructorNotes, updateProjectStatus } = useData();
    const { user } = useAuth();
    const project = projects.find(p => p.id === projectId);
    const [note, setNote] = useState('');
    const [checkInText, setCheckInText] = useState('');
    
    // Determine whose data we are looking at
    const studentId = targetStudentId || user.id;
    const isInstructor = user.role !== ROLES.STUDENT && targetStudentId;
    
    // Filter data for this project and student
    const studentCheckIns = checkIns.filter(ci => ci.project_id === projectId && ci.student_id === studentId);
    const currentState = projectStates.find(ps => ps.project_id === projectId && ps.student_id === studentId);
    
    // Instructor updates notes
    const handleSaveNotes = () => {
        updateInstructorNotes(projectId, studentId, note);
    };

    // Student posts check-in
    const handleCheckIn = (e) => {
        e.preventDefault();
        if(!checkInText) return;
        addCheckIn({ projectId, studentId, type: 'progress', content: checkInText, imageMockUrl: null });
        setCheckInText('');
    };
    
    const handleStatusChange = (newStatus) => {
        updateProjectStatus(projectId, studentId, newStatus);
    };

    if (!project) return <div>Project not found</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors mb-4"><ArrowLeft size={18} /> Back</button>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{project.title}</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{project.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Code: {project.code}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${currentState?.status === 'submitted' ? 'bg-purple-100 text-purple-800' : currentState?.status === 'reviewed' ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-500'}`}>Status: {currentState?.status?.replace('_', ' ') || 'Not Started'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CHECK-INS / ACTIVITY STREAM */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Clock size={18}/> Activity Stream</h3>
                    <div className="space-y-4">
                        {studentCheckIns.length === 0 && <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">No activity recorded yet.</div>}
                        {studentCheckIns.map(ci => (
                            <div key={ci.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                                    {ci.type === 'instructor_comment' ? <Shield size={18} /> : <User size={18} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{ci.type === 'instructor_comment' ? 'Instructor' : 'Student'}</span>
                                        <span className="text-xs text-slate-400">{new Date(ci.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{ci.content}</p>
                                    {ci.image_url && <div className="mt-2 h-20 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">Image Mock</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {!isInstructor ? (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 sticky bottom-4 shadow-xl">
                            <form onSubmit={handleCheckIn}>
                                <textarea 
                                    value={checkInText}
                                    onChange={e => setCheckInText(e.target.value)}
                                    placeholder="Post an update..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none mb-2"
                                    rows={3}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button type="button" className="p-2 text-slate-400 hover:text-emerald-500"><Camera size={18}/></button>
                                        <button type="button" onClick={() => handleStatusChange('submitted')} className="text-xs font-bold text-emerald-600 hover:text-emerald-500 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">Mark as Submitted</button>
                                    </div>
                                    <Button type="submit" size="sm" disabled={!checkInText}><Send size={14}/> Post</Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-slate-900 p-4 rounded-xl text-white sticky bottom-4 shadow-xl">
                            <h4 className="font-bold text-sm mb-2 text-emerald-400">Instructor Feedback</h4>
                            <textarea 
                                value={note} 
                                onChange={e => setNote(e.target.value)} 
                                className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white outline-none focus:border-emerald-500 mb-2" 
                                placeholder="Add grading notes or private feedback..."
                                defaultValue={currentState?.instructor_notes || ''}
                            />
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button onClick={() => handleStatusChange('reviewed')} className="px-3 py-1 bg-lime-500/20 text-lime-400 text-xs font-bold rounded hover:bg-lime-500/30">Mark Reviewed</button>
                                    <button onClick={() => handleStatusChange('revision_requested')} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded hover:bg-red-500/30">Request Revision</button>
                                </div>
                                <Button onClick={handleSaveNotes} size="sm">Save Notes</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PROJECT RESOURCES / STATUS (Simplified) */}
                <div>
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <li className="flex items-center gap-2 cursor-pointer hover:underline"><Download size={14}/> Project Brief.pdf</li>
                            <li className="flex items-center gap-2 cursor-pointer hover:underline"><Download size={14}/> Starter_Code.zip</li>
                            <li className="flex items-center gap-2 cursor-pointer hover:underline"><HelpCircle size={14}/> Grading Rubric</li>
                        </ul>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const ProgressMatrix = ({ onSelectStudent }) => {
    const { projects, enrollments, currentSemesterId, projectStates, profiles } = useData();
    const semesterProjects = projects.filter(p => p.semester_id === currentSemesterId).sort((a,b) => a.sequence_order - b.sequence_order);
    const semesterEnrollments = enrollments.filter(e => e.semester_id === currentSemesterId).sort((a,b) => parseInt(a.tag_number || 0) - parseInt(b.tag_number || 0));

    const getStatusColor = (status) => {
        switch(status) {
            case 'reviewed': return 'bg-lime-400';
            case 'submitted': return 'bg-purple-400';
            case 'in_progress': return 'bg-amber-400';
            case 'revision_requested': return 'bg-red-400';
            default: return 'bg-slate-200 dark:bg-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Progress Matrix</h2>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-max bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 sticky left-0 z-10 w-48 font-bold text-slate-600 dark:text-slate-300">Student</th>
                                {semesterProjects.map(p => (
                                    <th key={p.id} className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase text-center w-24">
                                        <div className="truncate w-24" title={p.title}>{p.code}</div>
                                    </th>
                                ))}
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase text-center">Avg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semesterEnrollments.map(enrollment => {
                                const profile = profiles.find(p => p.id === enrollment.profile_id);
                                const displayName = profile ? profile.full_name : (enrollment.email || 'Unknown');
                                const displayTag = enrollment.tag_number || '??';
                                
                                // Simple completion calculation
                                let completedCount = 0;

                                return (
                                    <tr key={enrollment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-3 border-b border-r border-slate-100 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectStudent && onSelectStudent(enrollment.profile_id)}>
                                                <span className="font-mono text-xs font-bold text-slate-400 w-6">{displayTag}</span>
                                                <span className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate w-32">{displayName}</span>
                                            </div>
                                        </td>
                                        {semesterProjects.map(p => {
                                            const state = projectStates.find(ps => ps.project_id === p.id && ps.student_id === enrollment.profile_id);
                                            const status = state?.status || 'not_started';
                                            if (status === 'reviewed' || status === 'submitted') completedCount++;
                                            
                                            return (
                                                <td key={p.id} className="p-3 border-b border-slate-100 dark:border-slate-800 text-center">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full mx-auto ${getStatusColor(status)} cursor-pointer hover:scale-125 transition-transform`} 
                                                        title={status}
                                                        onClick={() => onSelectStudent && onSelectStudent(enrollment.profile_id)} // Ideally could open specific project detail
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td className="p-3 border-b border-slate-100 dark:border-slate-800 text-center font-mono text-xs font-bold text-slate-500">
                                            {semesterProjects.length > 0 ? Math.round((completedCount / semesterProjects.length) * 100) : 0}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-lime-400"></div> Reviewed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-400"></div> Submitted</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div> In Progress</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div> Revision Needed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div> No Status</div>
            </div>
        </div>
    );
};

export const StudentProfile = ({ studentId, onBack, onSelectProject }) => {
    const { profiles, enrollments, checkIns, projects, projectStates, currentSemesterId } = useData();
    const student = profiles.find(p => p.id === studentId);
    const enrollment = enrollments.find(e => e.profile_id === studentId && e.semester_id === currentSemesterId);
    const studentProjects = projects.filter(p => p.semester_id === currentSemesterId);
    
    // Sort projects by sequence
    studentProjects.sort((a,b) => a.sequence_order - b.sequence_order);

    if (!student) return <div>Student not found</div>;

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors mb-4"><ArrowLeft size={18} /> Back to Roster</button>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-start gap-6">
                 <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                     {student.full_name?.charAt(0) || student.email?.charAt(0)}
                 </div>
                 <div>
                     <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{student.full_name}</h1>
                     <div className="text-slate-500">{student.email}</div>
                     <div className="mt-2 flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-300">Tag #{enrollment?.tag_number || 'N/A'}</span>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-300">ID: {enrollment?.student_number || 'N/A'}</span>
                     </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Project Progress</h3>
                    <div className="space-y-3">
                        {studentProjects.map(project => {
                             const state = projectStates.find(ps => ps.project_id === project.id && ps.student_id === studentId);
                             const status = state?.status || 'not_started';
                             return (
                                 <div key={project.id} onClick={() => onSelectProject(project.id, studentId)} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:border-emerald-500 transition-colors group">
                                     <div>
                                         <div className="text-xs font-bold text-slate-400">{project.code}</div>
                                         <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">{project.title}</div>
                                     </div>
                                     <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${status === 'reviewed' ? 'bg-lime-100 text-lime-800' : status === 'submitted' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                                         {status.replace('_', ' ')}
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {checkIns.filter(ci => ci.student_id === studentId).slice(0, 5).map(ci => (
                             <div key={ci.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                 <div className="flex justify-between text-xs text-slate-400 mb-1">
                                     <span>{new Date(ci.created_at).toLocaleDateString()}</span>
                                     <span className="capitalize">{ci.type}</span>
                                 </div>
                                 <p className="text-sm text-slate-700 dark:text-slate-300">{ci.content}</p>
                             </div>
                        ))}
                        {checkIns.filter(ci => ci.student_id === studentId).length === 0 && <div className="text-slate-400 text-sm">No activity log.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
