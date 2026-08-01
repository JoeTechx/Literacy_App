'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '@/utils/api';

export default function SuperadminSummary() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [stats, setStats] = useState({ uptime: '99.98%', totalUsers: 0 });

  useEffect(() => {
    const fetchSuperadminData = async () => {
      try {
        const usersRes = await api.get('/users');
        const users = usersRes.data || [];

        // 1. Chart Data (Group by created month/day)
        // For simplicity, we just aggregate total users grouped by Role for now
        const studentsCount = users.filter((u:any) => u.role === 'student').length;
        const teachersCount = users.filter((u:any) => u.role === 'teacher').length;
        
        // Since we might not have historical data for a rich chart, we'll plot a single point if needed,
        // or just use a simple dynamic array that represents 'now'
        setChartData([
          { name: 'Current', students: studentsCount, teachers: teachersCount }
        ]);

        // 2. Audit Data (List of all Admin & Teacher users as 'Staff Directory')
        const staff = users.filter((u:any) => u.role !== 'student').map((u:any, index: number) => ({
          id: u.userId || index,
          name: u.name,
          role: u.role,
          email: u.email || 'N/A',
          status: 'Active'
        }));

        setAuditData(staff);
        setStats({ uptime: '100%', totalUsers: users.length });

      } catch (err) {
        console.error("Failed to fetch superadmin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuperadminData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Superadmin Analytics...</div>;

  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center gap-3 text-purple-400 mb-6">
        <Server className="h-7 w-7" />
        <h3 className="text-2xl font-bold text-foreground">Superadmin Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-panel p-6 border-purple-500/20"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">Platform Growth (Active Users)</h4>
              <p className="text-sm text-muted-foreground">Current user distribution</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Students</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Teachers</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '14px' }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                  <Area type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTeachers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 bg-blue-500/5">
            <Activity className="h-8 w-8 text-blue-400 mb-4" />
            <p className="text-sm text-muted-foreground">Server Uptime</p>
            <p className="text-3xl font-bold text-foreground">{stats.uptime}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 bg-purple-500/5">
            <Server className="h-8 w-8 text-purple-400 mb-4" />
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
          </motion.div>
        </div>
      </div>

      {/* System Audit Log Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold text-foreground">Staff Directory</h4>
            <p className="text-sm text-muted-foreground">Overview of Admins and Teachers in the system</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditData.length > 0 ? auditData.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground capitalize">{row.role}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{row.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {row.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No staff found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
