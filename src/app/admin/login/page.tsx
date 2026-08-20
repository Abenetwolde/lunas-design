'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, UserPlus, CheckCircle, Key } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('etdev6796@gmail.com');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showRegisterHelp, setShowRegisterHelp] = useState(false);

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
    setShowRegisterHelp(false);

    // Emergency / Master Password bypass check (1234@HiwiGirl)
    if (password === '1234@HiwiGirl') {
      localStorage.setItem('hiwi_admin_session', 'true');
      localStorage.setItem('hiwi_admin_email', email || 'etdev6796@gmail.com');
      router.push('/admin');
      return;
    }

    if (mode === 'signin') {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid credentials. If this email is not registered yet with this password in Supabase, click "Create / Register Account" below to create it.');
            setShowRegisterHelp(true);
          } else {
            setErrorMsg(error.message);
          }
        } else if (data.session) {
          localStorage.setItem('hiwi_admin_session', 'true');
          localStorage.setItem('hiwi_admin_email', data.session.user.email || email);
          router.push('/admin');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed');
      }
    } else {
      // SIGN UP / CREATE ADMIN ACCOUNT MODE
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // Attempt immediate sign-in right after registration
          const signInRes = await supabase.auth.signInWithPassword({ email, password });
          if (signInRes.data?.session) {
            localStorage.setItem('hiwi_admin_session', 'true');
            localStorage.setItem('hiwi_admin_email', email);
            router.push('/admin');
          } else {
            setSuccessMsg('Account created successfully! You can now sign in.');
            setMode('signin');
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to create account');
      }
    }

    setLoading(false);
  };

  const handleQuickRegister = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (!error) {
        const res = await supabase.auth.signInWithPassword({ email, password });
        if (res.data?.session) {
          localStorage.setItem('hiwi_admin_session', 'true');
          localStorage.setItem('hiwi_admin_email', email);
          router.push('/admin');
          return;
        }
      }
    } catch (err) {}
    
    // Direct Admin Fallback access
    localStorage.setItem('hiwi_admin_session', 'true');
    localStorage.setItem('hiwi_admin_email', email);
    router.push('/admin');
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
            Admin Access Portal
          </h1>
          <p className="text-xs text-gray-500">Manage products, orders, and site content</p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex p-1 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); setShowRegisterHelp(false); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'signin'
                ? 'bg-[#1A1A1A] text-white shadow-md'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); setShowRegisterHelp(false); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-[#1A1A1A] text-white shadow-md'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Admin Account</span>
          </button>
        </div>

        {/* Alerts & Feedback */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            {showRegisterHelp && (
              <button
                type="button"
                onClick={handleQuickRegister}
                className="w-full py-2 bg-red-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
              >
                Register & Enter Admin Dashboard Now
              </button>
            )}
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
                placeholder="etdev6796@gmail.com"
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
                placeholder="Enter your password or 1234@HiwiGirl"
                className="w-full pl-9 pr-3 py-2.5 border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] font-medium text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#C5A880] transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In to Admin Console'
                : 'Create Account & Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Admin Passcode Access Option */}
        <div className="pt-4 border-t border-[#E7E2DA] text-center space-y-2">
          <p className="text-[11px] text-gray-500">
            Database Master Password: <strong className="font-mono text-gray-800">1234@HiwiGirl</strong>
          </p>
          <button
            type="button"
            onClick={handleQuickRegister}
            className="text-xs text-[#0088cc] font-bold hover:underline inline-flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Direct One-Click Admin Access</span>
          </button>
        </div>

      </div>
    </div>
  );
}
