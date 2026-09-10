import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import { getActiveUser, getAllUsers } from '@/app/actions';
import { Ship, Lock } from 'lucide-react';

export default async function LoginPage() {
  const { role, user } = await getActiveUser();
  const allUsers = await getAllUsers();

  const currentUserData = user && role ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: role,
  } : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans pb-16">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-4xl mx-auto py-10 px-4 w-full flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black mx-auto shadow-lg shadow-orange-600/25">
            <Ship className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black font-serif text-slate-900 tracking-tight">
            VyaparFlow Portal Authentication
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Sign in to access your export readiness score, manage compliance documents, or evaluate as an industry evaluator.
          </p>
        </div>

        {/* Auth Interface wrapped in Suspense for search params */}
        <Suspense fallback={<div className="text-center py-12 text-sm text-slate-500">Loading authentication interface...</div>}>
          <AuthContainer currentUser={currentUserData} />
        </Suspense>
      </main>

      {/* Simple Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200/60">
        © 2026 VyaparFlow Platform — Palghar MSME Export Operating System
      </footer>
    </div>
  );
}
