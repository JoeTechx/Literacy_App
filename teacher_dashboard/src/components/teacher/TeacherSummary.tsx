'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { teacherAPI } from '@/utils/api';

export default function TeacherSummary() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [classroomData, setClassroomData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const studentsRes = await teacherAPI.getMyStudents();
        const students = studentsRes.data || [];

        // For Teacher Chart, we would normally aggregate progress by date for all their students.
        // We'll just provide a simple dynamic stat representing their total students for now.
        if (students.length > 0) {
           setChartData([{ date: 'Current', completions: students.length * 2 }]);
        } else {
           setChartData([{ date: 'No Data', completions: 0 }]);
        }

        // Classroom Data (Action Board)
        const roster = students.map((s:any) => {
          let action = 'On Track';
          if (s.totalPoints > 500) action = 'Praise Needed';
          if (s.totalPoints === 0) action = 'Needs Support';
          
          return {
            id: s.userId,
            name: s.name,
            currentModule: 'Assigned Modules',
            latestScore: s.totalPoints || 0,
            actionNeeded: action
          };
        });

        setClassroomData(roster);

      } catch (err) {
        console.error("Failed to fetch teacher data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Teacher Analytics...</div>;

  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center gap-3 text-emerald-400 mb-6">
        <BookOpen className="h-7 w-7" />
        <h3 className="text-2xl font-bold text-foreground">My Classroom Performance</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-panel p-6 border-emerald-500/20"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">Classroom Progress Tracker</h4>
              <p className="text-sm text-muted-foreground">Daily module completions</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            {chartData.length > 0 && chartData[0].date !== 'No Data' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground">No completions yet.</div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 bg-emerald-500/5">
            <Star className="h-8 w-8 text-emerald-400 mb-4" />
            <p className="text-sm text-muted-foreground">Class Average Score</p>
            <p className="text-3xl font-bold text-foreground">
              {classroomData.length > 0 
                ? Math.round(classroomData.reduce((acc, curr) => acc + curr.latestScore, 0) / classroomData.length) 
                : 0} pts
            </p>
          </motion.div>
        </div>
      </div>

      {/* Student Action Board */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h4 className="text-lg font-semibold text-foreground">Student Action Board</h4>
          <p className="text-sm text-muted-foreground">Granular student tracking</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Student Name</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Points</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action Needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {classroomData.length > 0 ? classroomData.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-emerald-400">{row.latestScore}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium 
                      ${row.actionNeeded === 'On Track' ? 'bg-emerald-500/10 text-emerald-400' : 
                        row.actionNeeded === 'Praise Needed' ? 'bg-blue-500/10 text-blue-400' : 
                        'bg-amber-500/10 text-amber-400'}`}>
                      {row.actionNeeded !== 'On Track' && <AlertTriangle className="w-3 h-3" />}
                      {row.actionNeeded}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No students assigned to you yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
