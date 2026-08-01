'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Users, GraduationCap, BookOpen, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import SuperadminSummary from './SuperadminSummary';
import AdminSummary from './AdminSummary';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const usersRes = await api.get('/users');
        const users = usersRes.data;
        
        const teachers = users.filter((u: any) => u.role === 'teacher').length;
        const students = users.filter((u: any) => u.role === 'student').length;
        const admins = users.filter((u: any) => u.role === 'admin' || u.role === 'superadmin').length;

        setStats({
          totalUsers: users.length,
          teachers,
          students,
          admins,
        });
      } catch (err) {
        console.error("Failed to fetch overview data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Students', value: stats?.students || 0, icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Active Teachers', value: stats?.teachers || 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Platform Admins', value: stats?.admins || 0, icon: AlertCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="glass-panel p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.name}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className={`absolute -bottom-10 -right-10 opacity-0 group-hover:opacity-10 transition-opacity h-32 w-32 rounded-full blur-2xl ${card.bg.replace('/10', '')}`} />
          </motion.div>
        ))}
      </div>

      {user?.role === 'superadmin' ? <SuperadminSummary /> : <AdminSummary />}
      
    </div>
  );
}
