import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Shield } from 'lucide-react';

interface AdminSettingsProps {
  role: string;
  schoolName: string;
  setSchoolName: (val: string) => void;
  autoApprove: boolean;
  setAutoApprove: (val: boolean) => void;
  maintMode: boolean;
  setMaintMode: (val: boolean) => void;
}

export default function AdminSettings({ 
  role, 
  schoolName, 
  setSchoolName, 
  autoApprove, 
  setAutoApprove, 
  maintMode, 
  setMaintMode 
}: AdminSettingsProps) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 border-border">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><Monitor className="w-5 h-5"/> Institution Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1">Institution Name</label>
            <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border mt-4">
            <div>
              <h5 className="font-medium text-foreground">Auto-Approve Teachers</h5>
              <p className="text-xs text-muted-foreground">Automatically allow new teachers to join using the institution code</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Superadmin Settings */}
      {role === 'superadmin' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 border-red-500/20 bg-red-500/5 mt-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400"><Shield className="w-5 h-5"/> System Administration</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-red-500/20">
              <div>
                <h5 className="font-medium text-foreground text-red-100">Maintenance Mode</h5>
                <p className="text-xs text-red-300/70">Prevent new logins and show maintenance page to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={maintMode} onChange={(e) => setMaintMode(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
