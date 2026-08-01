import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface TeacherSettingsProps {
  notifications: boolean;
  setNotifications: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function TeacherSettings({ notifications, setNotifications, darkMode, setDarkMode }: TeacherSettingsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 border-border">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Preferences</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Email Notifications</h5>
            <p className="text-xs text-muted-foreground">Receive weekly progress reports for your students</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Dark Mode</h5>
            <p className="text-xs text-muted-foreground">Toggle the dashboard appearance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </motion.div>
  );
}
