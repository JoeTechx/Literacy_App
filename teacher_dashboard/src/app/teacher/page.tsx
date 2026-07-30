'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, PlusCircle, LogOut, X, ShieldAlert } from 'lucide-react';
import { teacherAPI, uploadAPI } from '@/utils/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function TeacherDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('modules');
  const [students, setStudents] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', type: 'tap_the_sound', ageGroup: '5-7', content: [{}] as any[] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Students shouldn't be here. Admins are allowed.
    if (user.role === 'student') {
      router.push('/');
      return;
    }

    fetchTeacherData();
  }, [user, router]);

  const fetchTeacherData = async () => {
    try {
      const [studentsRes, modulesRes] = await Promise.all([
        teacherAPI.getMyStudents(),
        teacherAPI.getMyModules()
      ]);
      setStudents(studentsRes.data);
      setModules(modulesRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        router.push('/login');
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: newModule.title,
        type: newModule.type,
        ageGroup: newModule.ageGroup,
        content: newModule.content
      };
      
      await teacherAPI.createModule(payload);
      setIsModalOpen(false);
      setNewModule({ title: '', type: 'tap_the_sound', ageGroup: '5-7', content: [{}] });
      fetchTeacherData();
    } catch (err: any) {
      alert("Error saving module: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateContentRow = (index: number, field: string, value: any) => {
    const updated = [...newModule.content];
    updated[index] = { ...updated[index], [field]: value };
    setNewModule({ ...newModule, content: updated });
  };

  const addContentRow = () => {
    setNewModule({ ...newModule, content: [...newModule.content, {}] });
  };

  const removeContentRow = (index: number) => {
    if (newModule.content.length <= 1) return;
    const updated = newModule.content.filter((_, i) => i !== index);
    setNewModule({ ...newModule, content: updated });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadAPI.uploadFile(file);
      updateContentRow(index, 'image_url', res.data.url);
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    }
  };

  if (!user || user.role === 'student') return null;

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Teacher Sidebar */}
      <aside className="w-72 glass-panel !rounded-none !border-y-0 !border-l-0 p-8 flex flex-col z-20 shadow-2xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <BookOpen className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Literacy App</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Teacher Portal {isAdmin && "(Admin Mode)"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'modules' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
            onClick={() => setActiveTab('modules')}
          >
            <BookOpen size={20} /> My Modules
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'students' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={20} /> My Students
          </button>
        </nav>

        <div className="mt-auto">
          {isAdmin && (
            <button 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors font-semibold border border-blue-500/20 cursor-pointer shadow-lg shadow-blue-500/5 group"
              onClick={() => router.push('/admin')}
            >
              <ShieldAlert size={18} className="group-hover:scale-110 transition-transform" /> Return to Admin Portal
            </button>
          )}

          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white/5 border border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${isAdmin ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium cursor-pointer group"
            onClick={handleLogout}
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {activeTab === 'modules' && 'Learning Modules'}
              {activeTab === 'students' && 'My Students'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your classroom and curriculum.
            </p>
          </div>
          
          {activeTab === 'modules' && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-colors cursor-pointer" 
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={20} /> Create Module
            </motion.button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'modules' && (
            <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={mod.id} className="glass-panel p-6 flex flex-col group hover:border-emerald-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                      Age: {mod.ageGroup}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Type: {mod.type.replace(/_/g, ' ')}</p>
                  <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Created: {new Date(mod.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              {modules.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl">
                  <BookOpen className="mx-auto w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No modules created yet. Click "Create Module" to start.</p>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-panel overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border">
                    <th className="p-5 font-semibold text-sm text-muted-foreground">Student Name</th>
                    <th className="p-5 font-semibold text-sm text-muted-foreground">Age</th>
                    <th className="p-5 font-semibold text-sm text-muted-foreground">Progress Stats</th>
                    <th className="p-5 font-semibold text-sm text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={student.id} className="border-b border-border hover:bg-white/5 transition-colors">
                      <td className="p-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{student.name}</span>
                      </td>
                      <td className="p-5 text-sm text-muted-foreground">{student.age || 'N/A'}</td>
                      <td className="p-5 font-bold text-amber-400">⭐ {student.totalPoints || 0}</td>
                      <td className="p-5 text-muted-foreground text-sm">{new Date(student.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-muted-foreground">
                        No students assigned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Module Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-xl p-8 shadow-2xl border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Module</h2>
                <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateModule} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground ml-1 mb-1 block">MODULE TITLE</label>
                  <input required type="text" className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Advanced Vowels" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-muted-foreground ml-1 mb-1 block">GAME TYPE</label>
                    <select className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none" value={newModule.type} onChange={e => setNewModule({...newModule, type: e.target.value})}>
                      <option value="tap_the_sound">Tap the Sound</option>
                      <option value="tracing">Letter Tracing</option>
                      <option value="match">Match Word-Image</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-muted-foreground ml-1 mb-1 block">TARGET AGE GROUP</label>
                    <select className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none" value={newModule.ageGroup} onChange={e => setNewModule({...newModule, ageGroup: e.target.value})}>
                      <option value="5-7">5-7 years (Beginner)</option>
                      <option value="8-10">8-10 years (Intermediate)</option>
                      <option value="11-12">11-12 years (Advanced)</option>
                      <option value="all">All Ages</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground ml-1 mb-1 block">
                    CONTENT PLAYLIST
                  </label>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {newModule.content.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-black/20 p-3 rounded-xl border border-white/5 relative">
                        <button type="button" onClick={() => removeContentRow(idx)} className="absolute -top-2 -right-2 bg-red-500/20 text-red-400 rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                          <X size={14} />
                        </button>
                        
                        {newModule.type === 'tap_the_sound' && (
                          <>
                            <div className="flex-1">
                              <input type="text" placeholder="Target Letter (e.g. A)" className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-emerald-500/50" value={row.target || ''} onChange={e => updateContentRow(idx, 'target', e.target.value)} required />
                            </div>
                            <div className="flex-1">
                              <input type="text" placeholder="Wrong Choice (e.g. B)" className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-emerald-500/50" value={row.wrong || ''} onChange={e => updateContentRow(idx, 'wrong', e.target.value)} required />
                            </div>
                          </>
                        )}

                        {newModule.type === 'tracing' && (
                          <div className="flex-1">
                            <input type="text" placeholder="Letter to trace (e.g. A)" className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-emerald-500/50" value={row.letter || ''} onChange={e => updateContentRow(idx, 'letter', e.target.value)} required />
                          </div>
                        )}

                        {newModule.type === 'match' && (
                          <div className="flex-1 space-y-2">
                            <input type="text" placeholder="Word (e.g. Cat)" className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-emerald-500/50" value={row.word || ''} onChange={e => updateContentRow(idx, 'word', e.target.value)} required />
                            
                            {row.image_url ? (
                              <div className="relative inline-block border-2 border-emerald-500/30 rounded-lg overflow-hidden group">
                                <img src={row.image_url} alt="Uploaded preview" className="h-20 w-32 object-cover" />
                                <button type="button" onClick={() => updateContentRow(idx, 'image_url', '')} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer">Change</button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                <div className="flex flex-col items-center justify-center pb-2">
                                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-emerald-400">Click to upload</span></p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(idx, e)} />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addContentRow} className="w-full mt-2 py-2 border-2 border-dashed border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
                    <PlusCircle size={16} /> Add Row
                  </button>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-colors cursor-pointer disabled:opacity-50" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Module'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
