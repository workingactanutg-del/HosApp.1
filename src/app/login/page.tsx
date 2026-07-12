'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle preset queries from landing page
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'patient' || roleParam === 'doctor' || roleParam === 'admin') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Set demo credentials for ease of testing
  const handleSelectDemoUser = (userRole: 'patient' | 'doctor' | 'admin') => {
    setRole(userRole);
    if (userRole === 'admin') {
      setEmail('admin@hosapp.com');
      setPassword('admin123');
    } else if (userRole === 'doctor') {
      setEmail('doctor@hosapp.com');
      setPassword('doctor123');
    } else {
      setEmail('patient@hosapp.com');
      setPassword('patient123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user object and token
      localStorage.setItem('hosapp_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        token: data.token
      }));

      // Route based on role
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-outline-variant/30 space-y-6">
      {/* Logo */}
      <div className="text-center flex flex-col items-center">
        <Link href="/" className="inline-block mb-1">
          <img src="/logo.png" alt="HOSAPP Logo" className="h-10 object-contain mx-auto" />
        </Link>
        <p className="text-on-primary-container text-[10px] font-bold uppercase tracking-wider">Clinical HMS Access</p>
      </div>

      {/* Tab Role Switcher */}
      <div className="bg-surface-container-low p-1.5 rounded-2xl flex gap-1 border border-outline-variant/20">
        {(['patient', 'doctor', 'admin'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setError('');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all capitalize ${
              role === r
                ? 'bg-secondary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high/40'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-container text-error text-xs p-4 rounded-xl font-medium border border-error/20 flex items-center gap-2 animate-shake">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`e.g. ${role}@hosapp.com`}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm text-on-surface"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm text-on-surface"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">login</span>
              <span>Sign In as {role}</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Users Fast Logins */}
      <div className="pt-4 border-t border-outline-variant/30 text-center">
        <p className="text-xs text-on-surface-variant font-medium mb-3">Quick Login (Demo Accounts)</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => handleSelectDemoUser('patient')}
            className="px-3 py-1.5 bg-surface-container-high/50 hover:bg-surface-container-high text-xs font-semibold rounded-lg text-primary transition-all border border-outline-variant/20"
          >
            Patient Demo
          </button>
          <button
            onClick={() => handleSelectDemoUser('doctor')}
            className="px-3 py-1.5 bg-surface-container-high/50 hover:bg-surface-container-high text-xs font-semibold rounded-lg text-primary transition-all border border-outline-variant/20"
          >
            Doctor Demo
          </button>
          <button
            onClick={() => handleSelectDemoUser('admin')}
            className="px-3 py-1.5 bg-surface-container-high/50 hover:bg-surface-container-high text-xs font-semibold rounded-lg text-primary transition-all border border-outline-variant/20"
          >
            Admin Demo
          </button>
        </div>
      </div>

      {role === 'patient' && (
        <div className="text-center pt-2 text-xs text-on-surface-variant font-semibold">
          Don't have an account?{' '}
          <Link href="/register" className="text-secondary hover:underline">
            Register now
          </Link>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-background py-12 px-6">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-outline-variant/30 flex justify-center py-16">
          <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
