'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { teacherAPI } from '@/utils/api';
import { Settings, Users, CheckCircle, Save } from 'lucide-react';
import TeacherSettings from './TeacherSettings';
import AdminSettings from './AdminSettings';

export default function SettingsView() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const initialSettings = user?.settings || {};

  // Teacher specific state
  const [notifications, setNotifications] = useState(initialSettings.notifications ?? true);
  const [darkMode, setDarkMode] = useState(initialSettings.darkMode ?? true);

  // Admin specific state
  const [schoolName, setSchoolName] = useState(initialSettings.schoolName || 'Global Academy');
  const [autoApprove, setAutoApprove] = useState(initialSettings.autoApprove ?? false);

  // Superadmin specific state
  const [maintMode, setMaintMode] = useState(initialSettings.maintMode ?? false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const settings = {
        notifications,
        darkMode,
        schoolName,
        autoApprove,
        maintMode,
      };

      await teacherAPI.saveSettings(settings);
      updateUser({ settings });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const detail = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Settings save failed:', err.response?.data || err);
      setError(`Failed to save settings: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center gap-3 text-foreground mb-6">
        <Settings className="h-7 w-7" />
        <h3 className="text-2xl font-bold text-foreground">Platform Settings</h3>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <p className="text-red-500 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Details (All Roles) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 border-border">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Profile Settings</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-1">Full Name</label>
                  <input type="text" defaultValue={user.name} disabled className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-foreground opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-1">Email Address</label>
                  <input type="email" defaultValue={user.email} disabled className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-foreground opacity-70 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-1">Role</label>
                <input type="text" defaultValue={user.role} disabled className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-foreground opacity-70 cursor-not-allowed uppercase" />
              </div>
            </div>
          </motion.div>

          {/* Teacher Settings */}
          {user.role === 'teacher' && (
            <TeacherSettings
              notifications={notifications}
              setNotifications={setNotifications}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}

          {/* Admin Settings */}
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <AdminSettings
              role={user.role}
              schoolName={schoolName}
              setSchoolName={setSchoolName}
              autoApprove={autoApprove}
              setAutoApprove={setAutoApprove}
              maintMode={maintMode}
              setMaintMode={setMaintMode}
            />
          )}
        </div>

        {/* Save Changes Box */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8">
            <h4 className="text-lg font-semibold mb-2">Save Changes</h4>
            <p className="text-sm text-muted-foreground mb-6">Make sure to save your preferences before leaving this page.</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl font-bold shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
              ) : success ? (
                <><CheckCircle className="w-5 h-5" /> Saved Successfully</>
              ) : (
                <><Save className="w-5 h-5" /> Save Configuration</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
