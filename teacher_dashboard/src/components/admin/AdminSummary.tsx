'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, Clock, Award } from 'lucide-react';
import { adminAPI } from '@/utils/api';

export default function AdminSummary() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [studentRoster, setStudentRoster] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [studentsRes, progressRes] = await Promise.all([
          adminAPI.getStudents(),
          adminAPI.getAllProgress()
        ]);

        const students = studentsRes.data || [];
        const progress = progressRes.data || [];

        // Calculate Student Roster
        const roster = students.map((s:any) => {
          return {
            id: s.userId,
            name: s.name,
            points: s.totalPoints || 0,
            assignedTeacher: s.assignedTeacherName || 'Unassigned',
            lastActive: new Date(s.createdAt).toLocaleDateString()
          };
        });
        setStudentRoster(roster);

        // Chart Data - Group by moduleId and sum scores
        const moduleMap: Record<string, number> = {};
        progress.forEach((p:any) => {
           if (!moduleMap[p.moduleId]) moduleMap[p.moduleId] = 0;
           moduleMap[p.moduleId] += p.score || 0;
        });
        
        const cData = Object.keys(moduleMap).map(key => ({
           name: `Mod: ${key.substring(0,4)}`,
           score: moduleMap[key]
        }));
        
        // If no progress, provide a blank template to avoid breaking chart
        if (cData.length === 0) {
           setChartData([{ name: 'No Data', score: 0 }]);
        } else {
           setChartData(cData);
        }

      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Admin Analytics...</div>;

  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center gap-3 text-blue-400 mb-6">
        <Users className="h-7 w-7" />
        <h3 className="text-2xl font-bold text-foreground">Global Student Overview</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 border-blue-500/20"
        >
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-foreground">Total Score by Module</h4>
            <p className="text-sm text-muted-foreground">Aggregated performance across different module types</p>
          </div>
          <div className="h-[250px] w-full">
            {chartData.length > 0 && chartData[0].name !== 'No Data' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="score" fill="url(#colorScore)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground">No progress data yet.</div>
            )}
          </div>
        </motion.div>

        {/* Actionable Insights */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 border-amber-500/20 bg-amber-500/5">
            <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
              <Award className="h-5 w-5" /> Top Performing Students
            </h4>
            <div className="space-y-3 mt-4">
              {studentRoster.slice().sort((a,b) => b.points - a.points).slice(0, 2).map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-foreground">{s.name}</span>
                  <span className="font-bold text-amber-400">{s.points} pts</span>
                </div>
              ))}
              {studentRoster.length === 0 && <div className="text-sm text-muted-foreground">No students found.</div>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Active Student Roster */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h4 className="text-lg font-semibold text-foreground">Active Student Roster</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Student Name</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Teacher</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {studentRoster.length > 0 ? studentRoster.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {row.name.charAt(0)}
                    </div>
                    {row.name}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-amber-400">⭐ {row.points}</td>
                  <td className="py-4 px-6 text-sm text-emerald-400 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> {row.assignedTeacher}
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {row.lastActive}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
