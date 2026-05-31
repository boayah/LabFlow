'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FlaskConical,
  Microscope,
  AlertTriangle,
  ClipboardCheck,
  History,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/samples', label: 'Samples', icon: FlaskConical },
  { href: '/experiments', label: 'Experiment Runs', icon: Microscope },
  { href: '/deviations', label: 'Deviations', icon: AlertTriangle },
  { href: '/qc-report', label: 'QC Report', icon: ClipboardCheck },
  { href: '/audit-trail', label: 'Audit Trail', icon: History },
  { href: '/case-study', label: 'Case Study', icon: BookOpen },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center h-14 px-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">LabFlow QA</span>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={[
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white',
            ].join(' ')}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-xs text-slate-500 leading-tight">Demo instance</p>
        <p className="text-xs text-slate-500 leading-tight mt-0.5">labflow.internal</p>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-56 bg-slate-900 z-30">
        <NavContent />
      </aside>

      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md shadow"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-56 bg-slate-900 z-50 flex flex-col">
            <button
              className="absolute top-4 right-3 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
            <NavContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
