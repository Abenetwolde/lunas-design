'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated in Supabase session or localStorage
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const localAuth = localStorage.getItem('hiwi_admin_session');
      if (data.session || localAuth === 'true') {
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Emergency / Master Password bypass check (1234@HiwiGirl)
    if (password === '1234@HiwiGirl') {
      localStorage.setItem('hiwi_admin_session', 'true');
      localStorage.setItem('hiwi_admin_email', email || 'admin@hiwifashion.com');
      router.push('/admin');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Invalid login credentials. Please check email and password.');
      } else if (data.session) {
        localStorage.setItem('hiwi_admin_session', 'true');
        localStorage.setItem('hiwi_admin_email', data.session.user.email || email);
        router.push('/admin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E7E2DA] shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-[#C5A880] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A880] block">
            HIWI FASHION ATELIER
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Admin Sign In
          </h1>
          <p className="text-xs text-gray-500">Sign in to manage catalog, orders & settings</p>
        </div>

        {/* Alerts & Feedback */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-green-50 text-green-700 text-xs font-medium rounded-xl border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full pl-9 pr-3 py-2.5 border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] font-medium text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] font-medium text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#C5A880] transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

