'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { BrainCircuit, CalendarDays, Menu, PanelLeftClose, PanelLeftOpen, Settings, Zap } from 'lucide-react';

interface ContentEngineShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  mobileActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const navigationItems = [
  { href: '/', label: 'Kalender Konten', icon: CalendarDays },
  { href: '/production-studio', label: 'Production Studio', icon: BrainCircuit },
  { href: '/', label: 'Pengaturan', icon: Settings },
];

export default function ContentEngineShell({
  title,
  subtitle,
  eyebrow = 'Stage 2',
  actions,
  mobileActions,
  footer,
  children,
}: ContentEngineShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem('alco_content_sidebar_open');
    if (saved !== null) {
      setSidebarOpen(saved === 'true');
    } else if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      window.localStorage.setItem('alco_content_sidebar_open', String(next));
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {sidebarOpen && (
        <button
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'w-64 translate-x-0 p-4' : '-translate-x-full lg:w-16 lg:p-3'
        } flex shrink-0 flex-col`}
      >
        <div className={`mb-7 flex items-center gap-2 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Zap size={17} />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-foreground">ALCO Content</div>
                <div className="truncate text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Execution Engine</div>
              </div>
            )}
          </div>
          <button
            aria-label={sidebarOpen ? 'Ciutkan navigasi' : 'Buka navigasi'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition hover:bg-muted"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarOpen && <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workspace</p>}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === 'Kalender Konten' ? pathname === '/' : item.href !== '/' && pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-bold transition ${
                  !sidebarOpen ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="border-t border-sidebar-border pt-3 text-[10px] font-semibold leading-relaxed text-muted-foreground">
            Strategy-first content planning after ALCO Creative System.
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                aria-label="Buka navigasi"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition hover:bg-muted lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu size={17} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-black text-foreground md:text-base">{title}</h1>
                  <span className="shrink-0 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {eyebrow}
                  </span>
                </div>
                {subtitle && <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="hidden items-center gap-2 md:flex">{actions}</div>}
            {mobileActions && <div className="flex items-center gap-2 md:hidden">{mobileActions}</div>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {footer}
      </div>
    </main>
  );
}
