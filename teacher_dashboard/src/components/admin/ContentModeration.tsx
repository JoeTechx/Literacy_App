'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Trash2, Edit, Save, X, Loader2, AlertTriangle } from 'lucide-react';

export default function AdminContentModeration() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules');
      setModules(res.data);
    } catch (err) {
      console.error('Failed to fetch modules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete module "${title}"? This affects all students assigned to it.`)) return;
    
    try {
      await api.delete(`/modules/${id}`);
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleEdit = (module: any) => {
    setEditingModule(module);
    setEditForm(module);
    setError('');
  };

  const handleSave = async () => {
    if (!editingModule) return;
    setSaving(true);
    setError('');
    
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        difficulty: editForm.difficulty,
        minAge: editForm.minAge ? parseInt(editForm.minAge as any) : undefined,
        maxAge: editForm.maxAge ? parseInt(editForm.maxAge as any) : undefined,
      };
      
      const res = await api.patch(`/modules/${editingModule.id}`, payload);
      setModules(prev => prev.map(m => m.id === editingModule.id ? { ...m, ...res.data } : m));
      setEditingModule(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update module');
    } finally {
      setSaving(false);
    }
  };

  const filtered = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search modules by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors shadow-lg"
        />
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-20" />
            <p>No modules found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((module, idx) => (
              <motion.div 
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 hover:bg-white/5 transition-colors flex justify-between items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-foreground">{module.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider
                      ${module.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                        module.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'}`}
                    >
                      {module.difficulty || 'beginner'}
                    </span>
                    {(module.minAge || module.maxAge) && (
                      <span className="px-2 py-0.5 rounded bg-background/50 text-muted-foreground border border-border text-xs font-medium">
                        Ages: {module.minAge || 'Any'} - {module.maxAge || 'Any'}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">{module.description || module.type?.replace(/_/g, ' ')}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(module)}
                    className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Edit module"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(module.id, module.title)}
                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Edit className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Edit Module</h3>
                </div>
                <button 
                  onClick={() => setEditingModule(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                    <input 
                      type="text" 
                      value={editForm.title || ''} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:border-blue-500 transition-colors" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <textarea 
                      value={editForm.description || ''} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                      className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:border-blue-500 transition-colors resize-none" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Difficulty</label>
                      <select 
                        value={editForm.difficulty || 'beginner'}
                        onChange={e => setEditForm({...editForm, difficulty: e.target.value as any})}
                        className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:border-blue-500 transition-colors appearance-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Min Age</label>
                      <input 
                        type="number" 
                        value={editForm.minAge || ''} 
                        onChange={e => setEditForm({...editForm, minAge: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Max Age</label>
                      <input 
                        type="number" 
                        value={editForm.maxAge || ''} 
                        onChange={e => setEditForm({...editForm, maxAge: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3 bg-white/5">
                <button 
                  onClick={() => setEditingModule(null)}
                  className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
