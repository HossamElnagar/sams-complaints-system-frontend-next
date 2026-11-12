'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminUser, setAdminUser] = useState<{ fullName: string; role: string } | null>(null);

  // Check auth state on client mount
  useEffect(() => {
    const checkAuth = () => {
      const stored = sessionStorage.getItem('sams_admin');
      if (stored) {
        try {
          setAdminUser(JSON.parse(stored));
        } catch {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      // Store token safely in session storage
      sessionStorage.setItem('sams_token', data.accessToken);
      sessionStorage.setItem('sams_admin', JSON.stringify(data.admin));
      setAdminUser(data.admin);
      setIsLoginModalOpen(false);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setLoginError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sams_token');
    sessionStorage.removeItem('sams_admin');
    setAdminUser(null);
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#07182c]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xs">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Academy Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-14 h-14 overflow-hidden rounded-full ring-2 ring-[#c59b27]/60 group-hover:ring-[#c59b27] transition-all bg-white p-0.5">
              <Image
                src="/images/SAMS شعار الاكاديمية.jpeg"
                alt="شعار أكاديمية السادات للعلوم الإدارية"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl text-[#0a2240] dark:text-slate-100 leading-tight">
                أكاديمية السادات للعلوم الإدارية
              </span>
              <span className="text-xs md:text-sm text-[#c59b27] font-medium">
                بوابة الشكاوى الأكاديمية والتوجيه الذكي
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-slate-700 dark:text-slate-200">
            <Link href="/" className="hover:text-[#c59b27] transition-colors">
              الرئيسية
            </Link>
            <Link href="/#submit-ticket" className="hover:text-[#c59b27] transition-colors">
              تقديم شكوى
            </Link>
            <Link href="/tickets/track" className="hover:text-[#c59b27] transition-colors">
              متابعة شكوى
            </Link>
            {adminUser && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 font-bold text-[#c59b27] hover:underline"
              >
                <span>📊</span>
                <span>لوحة التحكم</span>
              </Link>
            )}
            {(adminUser?.role === 'AcademyPresident' || adminUser?.role === 'SuperAdmin') && (
              <Link
                href="/admin/president"
                className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                <span>🏛️</span>
                <span>بوابة الرئاسة (BI)</span>
              </Link>
            )}
          </nav>

          {/* Staff Login / Profile Trigger */}
          <div className="flex items-center gap-3">
            {adminUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-[#0a2240] dark:bg-[#c59b27] dark:text-[#07182c] rounded-lg border border-[#c59b27]/40 shadow-xs"
                >
                  <span>👤</span>
                  <span>{adminUser.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#1b497e] dark:hover:bg-[#12335c] rounded-lg shadow-sm border border-[#c59b27]/40 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#c59b27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>دخول الكادر الإداري</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Staff Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c1c30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#c59b27]" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  تسجيل دخول الكادر الإداري
                </h3>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              {loginError && (
                <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني الجامعي
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@academy.edu"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 font-bold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
