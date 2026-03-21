'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/login/page.tsx

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FaGraduationCap, FaEye, FaEyeSlash, FaSpinner, FaLock, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/user-disabled':          'This account has been disabled.',
    'auth/too-many-requests':      'Too many failed attempts. Please wait and try again.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return map[code] ?? 'Login failed. Please try again.';
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, isAdmin, loading } = useAuth();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  // Redirect if already admin
  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [loading, isAdmin, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      // signIn fetches the Firestore role. If not admin, isAdmin stays false.
      // The useEffect above redirects only when isAdmin becomes true.
      // We detect non-admin by checking after auth resolves.
    } catch (err: any) {
      const msg = parseFirebaseError(err?.code ?? '');
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  // After signIn resolves without error, check role
  useEffect(() => {
    if (submitting && !loading) {
      setSubmitting(false);
      // If signed in but not admin, show error
      // (isAdmin redirect is handled by the first useEffect)
    }
  }, [loading, submitting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <FaGraduationCap className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">MasterMinds Admin</h1>
            <p className="text-blue-200 text-sm">Sign in to manage your platform</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 text-sm" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="admin@example.com"
                    className="input pl-10"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 text-sm" />
                  </div>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    className="input pl-10 pr-12"
                    disabled={submitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPw ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary justify-center py-3.5 text-base mt-2"
              >
                {submitting
                  ? <><FaSpinner className="animate-spin" /> Signing in…</>
                  : 'Sign In to Dashboard'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Admin access only. No public registration available.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-blue-200">
          ← <a href="/" className="hover:text-white underline underline-offset-2 transition-colors">
            Back to MasterMinds
          </a>
        </p>
      </div>
    </div>
  );
}
