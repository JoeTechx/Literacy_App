'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Trash2, Edit, Save, X, Loader2,
  AlertTriangle, Volume2, PenTool, Layers, PlusCircle, Users,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  tap_the_sound: { label: 'Tap the Sound',    icon: Volume2,  color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  tracing:       { label: 'Letter Tracing',   icon: PenTool,  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  match:         { label: 'Match Word-Image', icon: Layers,   color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
};

const AGE_LABELS: Record<string, string> = {
  '5-7':  '5–7 yrs · Beginner',
  '8-10': '8–10 yrs · Intermediate',
  '11-12':'11–12 yrs · Advanced',
  'all':  'All Ages',
};

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] || { label: type, icon: BookOpen, color: 'text-muted-foreground bg-white/5 border-border' };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

// ── content row editors ────────────────────────────────────────────────────
function ContentRow({
  row, idx, type, onChange, onRemove, canRemove,
}: {
  row: any; idx: number; type: string;
  onChange: (idx: number, field: string, val: any) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
}) {
  const inputCls = 'w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none transition-colors';

  return (
    <div className="relative flex gap-2 items-start bg-black/20 p-3 rounded-xl border border-white/5">
      {/* Row number */}
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-muted-foreground flex items-center justify-center mt-1.5">
        {idx + 1}
      </span>

      <div className="flex-1 space-y-2">
        {type === 'tap_the_sound' && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Correct letter  (e.g. A)"
              className={inputCls}
              value={row.target || ''}
              onChange={e => onChange(idx, 'target', e.target.value)}
            />
            <input
              type="text"
              placeholder="Wrong choice  (e.g. B)"
              className={inputCls}
              value={row.wrong || ''}
              onChange={e => onChange(idx, 'wrong', e.target.value)}
            />
          </div>
        )}

        {type === 'tracing' && (
          <input
            type="text"
            placeholder="Letter to trace  (e.g. A)"
            className={inputCls}
            value={row.letter || ''}
            onChange={e => onChange(idx, 'letter', e.target.value)}
          />
        )}

        {type === 'match' && (
          <>
            <input
              type="text"
              placeholder="Word  (e.g. Cat)"
              className={inputCls}
              value={row.word || ''}
              onChange={e => onChange(idx, 'word', e.target.value)}
            />
            {row.image_url ? (
              <div className="relative inline-flex items-center gap-2">
                <img src={row.image_url} alt="preview" className="h-16 w-24 object-cover rounded-lg border border-border" />
                <button
                  type="button"
                  onClick={() => onChange(idx, 'image_url', '')}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-16 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-white/5 transition-colors text-xs text-muted-foreground gap-2">
                <Layers className="h-4 w-4" /> Click to upload image
                <input type="file" className="hidden" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const { uploadAPI } = await import('@/utils/api');
                    const res = await uploadAPI.uploadFile(file);
                    onChange(idx, 'image_url', res.data.url);
                  } catch { alert('Image upload failed'); }
                }} />
              </label>
            )}
          </>
        )}
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="flex-shrink-0 p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer mt-1"
          title="Remove row"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────
export default function AdminContentModeration() {
  const [modules, setModules]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [editingModule, setEditingModule] = useState<any | null>(null);

  // edit form mirrors the create form shape
  const [editTitle, setEditTitle]       = useState('');
  const [editAgeGroup, setEditAgeGroup] = useState('all');
  const [editContent, setEditContent]   = useState<any[]>([]);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  // ── data fetching ──────────────────────────────────────────────────────
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

  useEffect(() => { fetchModules(); }, []);

  // ── open edit modal ────────────────────────────────────────────────────
  const openEdit = (mod: any) => {
    setEditingModule(mod);
    setEditTitle(mod.title || '');
    setEditAgeGroup(mod.ageGroup || 'all');
    // Ensure content is always a non-empty array
    setEditContent(Array.isArray(mod.content) && mod.content.length > 0 ? mod.content : [{}]);
    setError('');
  };

  // ── content helpers ────────────────────────────────────────────────────
  const updateRow = (idx: number, field: string, val: any) => {
    const next = [...editContent];
    next[idx] = { ...next[idx], [field]: val };
    setEditContent(next);
  };
  const addRow    = () => setEditContent(prev => [...prev, {}]);
  const removeRow = (idx: number) => setEditContent(prev => prev.filter((_, i) => i !== idx));

  // ── save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingModule) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        title:    editTitle,
        ageGroup: editAgeGroup,
        content:  editContent,
      };
      const res = await api.patch(`/modules/${editingModule.id}`, payload);
      setModules(prev => prev.map(m => m.id === editingModule.id ? { ...m, ...res.data } : m));
      setEditingModule(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update module.');
    } finally {
      setSaving(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will affect all students assigned to it.`)) return;
    try {
      await api.delete(`/modules/${id}`);
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete module.');
    }
  };

  const filtered = modules.filter(m =>
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.type  || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by title or game type…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors shadow-lg"
        />
      </div>

      {/* Module list */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <BookOpen className="h-12 w-12 opacity-20" />
            <p className="text-sm">No modules found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((mod, idx) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-5 hover:bg-white/5 transition-colors flex justify-between items-center gap-4"
              >
                {/* Left info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-2.5 rounded-xl border ${(TYPE_META[mod.type] || { color: 'text-muted-foreground bg-white/5 border-border' }).color} flex-shrink-0`}>
                    {(() => { const I = (TYPE_META[mod.type] || { icon: BookOpen }).icon; return <I className="h-5 w-5" />; })()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-foreground truncate">{mod.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <TypeBadge type={mod.type} />
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 border border-border text-xs text-muted-foreground">
                        👥 {AGE_LABELS[mod.ageGroup] || mod.ageGroup || 'All Ages'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 border border-border text-xs text-muted-foreground">
                        <Layers className="h-3 w-3" /> {Array.isArray(mod.content) ? mod.content.length : 0} items
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 border border-emerald-500/20 text-xs text-emerald-400">
                        <Users className="h-3 w-3" /> {mod.assignedStudentsCount || 0} Students
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(mod)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mod.id, mod.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-panel w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Edit className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Edit Module</h3>
                    <TypeBadge type={editingModule.type} />
                  </div>
                </div>
                <button
                  onClick={() => setEditingModule(null)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Module Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="e.g. Advanced Vowels"
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none transition-colors text-sm"
                  />
                </div>

                {/* Age group — game type is read-only (changing type breaks content) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Target Age Group
                    </label>
                    <select
                      value={editAgeGroup}
                      onChange={e => setEditAgeGroup(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:border-blue-500 focus:outline-none transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="5-7">5–7 years  (Beginner)</option>
                      <option value="8-10">8–10 years  (Intermediate)</option>
                      <option value="11-12">11–12 years  (Advanced)</option>
                      <option value="all">All Ages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Game Type
                    </label>
                    <div className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 text-muted-foreground text-sm flex items-center gap-2 cursor-not-allowed">
                      <TypeBadge type={editingModule.type} />
                      <span className="text-xs opacity-60">(locked)</span>
                    </div>
                  </div>
                </div>

                {/* Content items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Content Items  ({editContent.length})
                    </label>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {editContent.map((row, i) => (
                      <ContentRow
                        key={i}
                        row={row}
                        idx={i}
                        type={editingModule.type}
                        onChange={updateRow}
                        onRemove={removeRow}
                        canRemove={editContent.length > 1}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addRow}
                    className="w-full mt-3 py-2.5 border-2 border-dashed border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/10 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <PlusCircle className="h-4 w-4" /> Add Row
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border flex justify-end gap-3 bg-white/5 flex-shrink-0">
                <button
                  onClick={() => setEditingModule(null)}
                  className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-white/10 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30 cursor-pointer text-sm"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
