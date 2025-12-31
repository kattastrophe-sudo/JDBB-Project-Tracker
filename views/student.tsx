import React, { useState } from 'react';
import { useData, useAuth } from '../data';
import { COLORS } from '../config';
import { Button } from '../components';
import { Layout, Clock, Calendar, AlertTriangle, AlertCircle, Settings, Camera, Shield, ArrowLeft } from 'lucide-react';

export const StudentDashboard = () => {
  const { currentSemesterId, semesters, scheduleItems, projects, projectStates, joinSemester } = useData();
  const { user } = useAuth();
  const currentSemester = semesters.find(s => s.id === currentSemesterId);
  
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [studentNum, setStudentNum] = useState('');
  
  const handleJoin = async (e) => {
      e.preventDefault();
      setJoinError('');
      if (!joinCode || !studentNum) return;
      const res = await joinSemester(joinCode, studentNum);
      if (!res.success) setJoinError(res.error);
      else window.location.reload(); 
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

export const StudentProfile = ({ studentId, onBack, onSelectProject }) => {
  const { profiles, enrollments, projects, projectStates, currentSemesterId } = useData();
  const profile = profiles.find(p => p.id === studentId);
  const enrollment = enrollments.find(e => e.profile_id === studentId && e.semester_id === currentSemesterId);
  const studentProjects = projects.filter(p => p.semester_id === currentSemesterId);

  const displayName = profile?.full_name || enrollment?.email || 'Student';
  const displayEmail = enrollment?.email || profile?.email || '';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{displayName}</h2>
              {displayEmail && <p className="text-slate-500">{displayEmail}</p>}
          </div>
          <div className="ml-auto flex gap-2">
             <div className="hidden md:block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                 TAG: {enrollment?.tag_number || 'N/A'}
             </div>
             <div className="hidden md:block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                 ID: {enrollment?.student_number || 'N/A'}
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentProjects.map(project => {
              const state = projectStates.find(ps => ps.project_id === project.id && ps.student_id === studentId);
              const status = state?.status || 'not_started';
              
              return (
                  <div key={project.id} onClick={() => onSelectProject && onSelectProject(project.id, studentId)} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <span className="font-mono text-xs font-bold text-slate-400">{project.code}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${status === 'submitted' ? 'bg-purple-100 text-purple-800' : status === 'reviewed' ? 'bg-lime-100 text-lime-800' : status === 'revision_requested' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'}`}>
                              {status.replace('_', ' ')}
                          </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10">{project.title}</h3>
                      <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={12} />
                          {state?.last_activity_at ? `Active ${new Date(state.last_activity_at).toLocaleDateString()}` : 'No activity'}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};
