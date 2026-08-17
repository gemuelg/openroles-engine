'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'All Jobs', href: '/' },
    { name: 'Companies', href: '/companies' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link href="/">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-gray-900 bg-gray-100/80'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Engine Pulse & Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Live Engine Pulse */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Engine Syncing
          </div>

          {/* Post Role Button */}
          <Link
            href="/submit"
            className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-blue-600 transition-colors shadow-sm"
          >
            + Post a Role
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Engine Syncing
            </div>
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white"
            >
              + Post a Role
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}