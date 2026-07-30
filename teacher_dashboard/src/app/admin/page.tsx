'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, LogOut, LayoutDashboard, ShieldAlert, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// Admin Components
import AdminOverview from '@/components/admin/Overview';
import AdminUserManagement from '@/components/admin/UserManagement';
import AdminContentModeration from '@/components/admin/ContentModeration';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Kick out if not admin
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-72 glass-panel !rounded-none !border-y-0 !border-l-0 p-8 flex flex-col z-20 shadow-2xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <ShieldAlert className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Literacy App</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'users' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> User Management
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'admin_modules' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
            onClick={() => setActiveTab('admin_modules')}
          >
            <BookOpen size={20} /> Content Moderation
          </button>
        </nav>

        <div className="mt-auto">
          {/* Teacher Mode Button */}
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-semibold border border-emerald-500/20 cursor-pointer shadow-lg shadow-emerald-500/5 group"
            onClick={() => router.push('/teacher')}
          >
            <GraduationCap size={18} className="group-hover:scale-110 transition-transform" /> Enter Teacher Mode
          </button>

          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white/5 border border-border">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg bg-blue-600">
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
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>

        <header className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {activeTab === 'overview' && 'Command Center'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'admin_modules' && 'Content Moderation'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage the entire platform ecosystem.
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminOverview />
            </motion.div>
          )}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminUserManagement />
            </motion.div>
          )}
          {activeTab === 'admin_modules' && (
            <motion.div key="admin_modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminContentModeration />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
