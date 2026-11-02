'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Database,
  GraduationCap,
  Sparkles,
  ExternalLink,
  X,
  Server,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'students' | 'courses' | 'database';
  onNavigate: (view: 'dashboard' | 'students' | 'courses' | 'database') => void;
  isDbConfigured: boolean;
  supabaseUrl: string | null;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onOpenCourseManager: () => void;
}

export function Sidebar({
  currentView,
  onNavigate,
  isDbConfigured,
  supabaseUrl,
  mobileOpen,
  onMobileClose,
  onOpenCourseManager,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'students' as const,
      label: 'Student Directory',
      icon: Users,
    },
    {
      id: 'courses' as const,
      label: 'Course Catalog',
      icon: BookOpen,
      action: onOpenCourseManager,
    },
    {
      id: 'database' as const,
      label: 'PostgreSQL & Schema',
      icon: Database,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C3BEB] flex items-center justify-center text-white shadow-sm shadow-violet-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-[#1E1B4B] tracking-tight">EduRankAI</h1>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F1ECFF] text-[#6C3BEB]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Student Management</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onNavigate(item.id);
                  }
                  onMobileClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F1ECFF] text-[#6C3BEB]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#6C3BEB]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Connection Status Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PostgreSQL DB
              </span>
              {isDbConfigured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Ready to link
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              {isDbConfigured ? supabaseUrl || 'Supabase PostgreSQL' : 'Configure keys in .env'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
