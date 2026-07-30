'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Trash2, Users, ShieldCheck, Loader2, X, Eye, EyeOff } from 'lucide-react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const currentUser = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    age: '',
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload: any = {
        name: form.name,
        role: form.role,
        password: form.password,
      };
      if (form.role !== 'student') {
        payload.email = form.email;
      }
      if (form.role === 'student' && form.age) {
        payload.age = parseInt(form.age);
      }

      await api.post('/users', payload);

      if (form.role === 'student') {
        setFormSuccess(`Student "${form.name}" created! Credentials can be handed directly to the student.`);
      } else {
        setFormSuccess(`Account created! A verification email has been sent to ${form.email}.`);
      }
      setForm({ name: '', email: '', password: '', role: 'teacher', age: '' });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColors: Record<string, string> = {
    superadmin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    teacher: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    student: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setShowModal(true); setFormError(''); setFormSuccess(''); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 ml-auto"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'teacher', 'student'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${roleFilter === r ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-background/50 text-muted-foreground border-border hover:border-muted'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-50" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-border">
                  <th className="p-5 font-semibold text-sm text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="p-5 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="p-5 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Verified</th>
                  <th className="p-5 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Age</th>
                  <th className="p-5 font-semibold text-sm text-muted-foreground text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-border hover:bg-white/5 transition-colors"
                  >
                    <td className="p-5 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email || '—'}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${roleColors[u.role] || 'bg-background/50 text-muted-foreground border-border'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5">
                      {u.role === 'student' ? (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      ) : u.isVerified ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-muted-foreground">{u.age ?? '—'}</span>
                    </td>
                    <td className="p-5 text-right">
                      {u.id !== currentUser?.id &&
                        !(currentUser?.role === 'admin' && (u.role === 'superadmin' || u.role === 'admin')) && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md p-8 shadow-2xl border-border relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                <X className="h-5 w-5" />
              </button>

              <h4 className="text-xl font-bold text-foreground mb-1">Create New User</h4>
              <p className="text-sm text-muted-foreground mb-6">Fill in the details to onboard a new user.</p>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(currentUser?.role === 'superadmin' ? ['admin', 'teacher', 'student'] : ['teacher', 'student']).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setForm({ ...form, role: r as any })}
                        className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all border cursor-pointer ${form.role === r ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-background/50 text-muted-foreground border-border'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder-muted-foreground focus:border-blue-500 text-sm" placeholder="e.g. Mrs. Adaobi Okafor" />
                </div>

                {form.role !== 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder-muted-foreground focus:border-blue-500 text-sm" placeholder="teacher@school.edu" />
                  </div>
                )}

                {form.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Age</label>
                    <input type="number" min={3} max={18} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder-muted-foreground focus:border-blue-500 text-sm" placeholder="e.g. 8" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 pr-12 text-foreground placeholder-muted-foreground focus:border-blue-500 text-sm" placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {formError && <p className="text-red-400 text-sm bg-red-500/20 p-3 rounded-lg border border-red-500/30">{formError}</p>}
                {formSuccess && <p className="text-emerald-400 text-sm bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30">{formSuccess}</p>}

                <button type="submit" disabled={formLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
                  {formLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><UserPlus className="h-5 w-5" /> Create User</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
