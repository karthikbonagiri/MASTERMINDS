'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/settings/page.tsx
// ============================================================
// Settings page
// - Shows how to create the first admin user in Firestore
// - Displays current admin info
// - Provides a one-click "Seed Admin" helper for initial setup
// ============================================================

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaUserShield, FaKey, FaInfoCircle, FaSpinner } from 'react-icons/fa';

export default function SettingsPage() {
  const { user, adminData } = useAuth();

  // ── Create new admin user ────────────────────────────────
  const [newEmail, setNewEmail]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating]       = useState(false);

  const handleCreateAdmin = async () => {
    if (!newEmail || !newPassword) {
      toast.error('Please fill in email and password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setCreating(true);
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      // 2. Store admin role in Firestore `users` collection
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: newEmail,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      toast.success(`Admin user ${newEmail} created successfully!`);
      setNewEmail('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create admin user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage admin accounts and platform configuration.</p>
      </div>

      {/* Current admin info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaUserShield className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Your Account</h2>
            <p className="text-xs text-gray-500">Currently signed in admin</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Role</p>
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              <FaUserShield size={11} /> {adminData?.role ?? 'admin'}
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
            <p className="text-xs text-gray-500 mb-1">Firebase UID</p>
            <p className="font-mono text-xs text-gray-700 break-all">{user?.uid}</p>
          </div>
        </div>
      </div>

      {/* Create new admin */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FaKey className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Create Admin User</h2>
            <p className="text-xs text-gray-500">Add a new administrator to the platform</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newadmin@example.com"
              className="input"
            />
          </div>
          <div>
            <label className="label">Password (min. 6 characters)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>
          <button
            onClick={handleCreateAdmin}
            disabled={creating}
            className="btn-primary"
          >
            {creating ? <><FaSpinner className="animate-spin" /> Creating…</> : 'Create Admin'}
          </button>
        </div>
      </div>

      {/* Firestore rules reference */}
      <div className="card p-6 border-l-4 border-orange-400">
        <div className="flex items-center gap-3 mb-4">
          <FaInfoCircle className="text-orange-500 text-xl" />
          <h2 className="font-semibold text-gray-900">Firestore Security Rules</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Deploy these rules in your Firebase console under{' '}
          <strong>Firestore → Rules</strong> to secure your database:
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check if the requesting user is an admin
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid))
          .data.role == 'admin';
    }

    // Users collection – admins can read/write all; users can read own doc
    match /users/{uid} {
      allow read, write: if isAdmin();
      allow read: if request.auth != null && request.auth.uid == uid;
    }

    // Job Notifications – public read, admin write
    match /jobNotifications/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Mock Tests – public read, admin write
    match /mockTests/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Mock Test Questions – authenticated read (to prevent scraping), admin write
    match /mockTestQuestions/{docId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Study Materials – public read (file URLs protected separately), admin write
    match /studyMaterials/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Article Posts – public read, admin write
    match /articlePosts/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Purchases – user can read own; admin can read all; API route writes
    match /purchases/{docId} {
      allow read: if request.auth != null &&
        (isAdmin() || resource.data.userId == request.auth.uid);
      allow write: if isAdmin();
    }
  }
}`}
        </pre>
        <p className="text-xs text-gray-400 mt-3">
          ⚠️ For production: also set Firebase Storage rules to restrict PDF/image access to paid users.
        </p>
      </div>
    </div>
  );
}
