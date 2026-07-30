'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/utils/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Lock, Mail, ShieldAlert, BadgeCheck } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;
      
      if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'superadmin') {
        setError('Access denied. Only staff can access this dashboard.');
        return;
      }

      setAuth(access_token, user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            Literacy App
          </h1>
          <p className="text-muted-foreground">Staff Portal — Teacher, Admin &amp; Superadmin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email Verified Success Banner */}
          <AnimatePresence>
            {isVerified && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3"
              >
                <BadgeCheck className="text-emerald-400 w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-emerald-400 text-sm font-semibold">Email Verified!</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5">Your account is now active. Please sign in below.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
              >
                <ShieldAlert className="text-destructive w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-destructive text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <input 
                type="email" 
                className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <input 
                type="password" 
                className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </motion.button>

        </form>
      </motion.div>
    </div>
  );
}

// useSearchParams requires a Suspense boundary in Next.js
export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
