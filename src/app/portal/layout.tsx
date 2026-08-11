'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Home, Clock, CreditCard, FolderCheck, Globe, LogOut } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const navItems = [
    { labelEn: 'Home Dashboard', labelHi: 'मुख्य पेज', href: '/portal/dashboard', icon: Home },
    { labelEn: 'My Spiritual Journey', labelHi: 'मेरी आध्यात्मिक यात्रा', href: '/portal/timeline', icon: Clock },
    { labelEn: 'My Payments & Receipts', labelHi: 'भुगतान एवं रसीदें', href: '/portal/payments', icon: CreditCard },
    { labelEn: 'Shared Documents & Remedies', labelHi: 'उपाय दस्तावेज', href: '/portal/documents', icon: FolderCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8E7] text-slate-900 flex flex-col selection:bg-amber-200">
      {/* Top Navbar */}
      <header className="bg-[#1A3C5E] text-white py-4 px-6 shadow-lg sticky top-0 z-30 border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/40 rounded-full flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg font-serif-heading text-amber-300">{BUSINESS_INFO.name}</h1>
              <p className="text-[10px] text-amber-100/80 uppercase tracking-widest font-medium">Client Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-amber-400/30 rounded-xl text-xs font-semibold text-amber-200 flex items-center gap-1.5 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिंदी (Hindi)' : 'English'}</span>
            </button>

            <button
              onClick={() => {
                document.cookie = 'dharmik_demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                router.push('/portal-login');
              }}
              className="p-2 text-slate-300 hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <div className="bg-white border-b border-amber-200/60 shadow-xs sticky top-[65px] z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-2 px-6 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'border-amber-600 text-[#1A3C5E] bg-amber-50/50'
                    : 'border-transparent text-slate-600 hover:text-[#1A3C5E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>{language === 'en' ? item.labelEn : item.labelHi}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1A3C5E] text-amber-100/70 py-6 text-center text-xs space-y-1 border-t border-amber-500/20">
        <p className="font-serif italic">॥ शुभम करोतु कल्याणम आरोग्यम धनसंपदा ॥</p>
        <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
