import React, { useState, useRef } from 'react';
import { useData, useAuth } from '../data';
import { ROLES } from '../config';
import { Button } from '../components';
import { Plus, Tag, ArrowLeft, Clock, Shield, User, Camera, Send, Download, HelpCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react';

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

export const ProjectDetail = ({ projectId, targetStudentId, onBack }) => {
    const { projects, checkIns, addCheckIn, projectStates, updateInstructorNotes, updateProjectStatus, uploadFile } = useData();
    const { user } = useAuth();
    const project = projects.find(p => p.id === projectId);
    const [note, setNote] = useState('');
    const [checkInText, setCheckInText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    
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
    const handleCheckIn = async (e) => {
        e.preventDefault();
        if(!checkInText && !imageFile) return;
        
        setIsUploading(true);
        let publicUrl = null;
        
        if (imageFile) {
            const result = await uploadFile(imageFile);
            if (result.success) {
                publicUrl = result.url;
            } else {
                alert(result.error);
                setIsUploading(false);
                return;
            }
        }
        
        await addCheckIn({ projectId, studentId, type: 'progress', content: checkInText, imageMockUrl: publicUrl });
        setCheckInText('');
        setImageFile(null);
        setIsUploading(false);
    };
    
    const handleStatusChange = (newStatus) => {
        updateProjectStatus(projectId, studentId, newStatus);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

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
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{ci.type === 'instructor_comment' ? 'Instructor' : 'Student'}</span>
                                        <span className="text-xs text-slate-400">{new Date(ci.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{ci.content}</p>
                                    {ci.image_url && (
                                        <div className="mt-3">
                                            <img src={ci.image_url} alt="Check-in attachment" className="rounded-lg max-h-48 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer" />
                                        </div>
                                    )}
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
                                
                                {imageFile && (
                                    <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center">
                                        <span className="text-xs truncate max-w-[200px] text-slate-500">{imageFile.name}</span>
                                        <button type="button" onClick={() => setImageFile(null)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <input type="file" ref={fileInputRef} onChange={e => e.target.files && setImageFile(e.target.files[0])} className="hidden" accept="image/*" />
                                        <button type="button" onClick={triggerFileSelect} className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${imageFile ? 'text-emerald-500' : 'text-slate-400'}`} title="Upload Photo">
                                            <ImageIcon size={18}/>
                                        </button>
                                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                        <button type="button" onClick={() => handleStatusChange('submitted')} className="text-xs font-bold text-emerald-600 hover:text-emerald-500 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">Mark as Submitted</button>
                                    </div>
                                    <Button type="submit" size="sm" disabled={(!checkInText && !imageFile) || isUploading}>
                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14}/>} {isUploading ? 'Posting...' : 'Post'}
                                    </Button>
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
    const { profiles, enrollments, projects, projectStates, currentSemesterId } = useData();
    
    const activeProjects = projects.filter(p => p.semester_id === currentSemesterId);
    const activeEnrollments = enrollments.filter(e => e.semester_id === currentSemesterId)
        .sort((a,b) => {
            const tagA = parseInt(a.tag_number) || 999;
            const tagB = parseInt(b.tag_number) || 999;
            return tagA - tagB;
        });
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'reviewed': return 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]';
            case 'submitted': return 'bg-purple-400';
            case 'in_progress': return 'bg-blue-400';
            case 'revision_requested': return 'bg-red-400';
            default: return 'bg-slate-200 dark:bg-slate-800';
        }
    };
  
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Progress Matrix</h2>
                  <p className="text-slate-500">Bird's-eye view of class performance.</p>
              </div>
              <div className="flex gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Working</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Submitted</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-lime-400"></div> Done</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Redo</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase sticky left-0 bg-slate-50 dark:bg-slate-950 z-20 w-48 border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">Student</th>
                          {activeProjects.map(p => (
                              <th key={p.id} className="p-3 text-xs font-bold text-slate-500 uppercase min-w-[100px] text-center border-r border-slate-100 dark:border-slate-800/50 last:border-0">
                                  <div className="truncate w-20 mx-auto" title={p.title}>{p.code}</div>
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeEnrollments.map(student => {
                          const profile = profiles.find(p => p.id === student.profile_id);
                          return (
                              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="p-3 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 cursor-pointer group" onClick={() => onSelectStudent && student.profile_id && onSelectStudent(student.profile_id)}>
                                      <div className="flex items-center gap-3">
                                          <div className="font-mono text-xs font-bold text-slate-400 w-6 text-right group-hover:text-emerald-500">{student.tag_number || '00'}</div>
                                          <div className="min-w-0">
                                              <div className="font-bold text-sm text-slate-700 dark:text-slate-300 truncate w-32 group-hover:text-emerald-500 transition-colors">{profile?.full_name || student.email.split('@')[0]}</div>
                                          </div>
                                      </div>
                                  </td>
                                  {activeProjects.map(p => {
                                      const state = projectStates.find(ps => ps.project_id === p.id && ps.student_id === student.profile_id);
                                      const status = state?.status || 'not_started';
                                      return (
                                          <td key={p.id} className="p-3 text-center border-r border-slate-50 dark:border-slate-800/50 last:border-0">
                                              <div className={`w-3 h-3 rounded-full mx-auto transition-all duration-500 ${getStatusColor(status)}`} title={status}></div>
                                          </td>
                                      );
                                  })}
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    );
  };
