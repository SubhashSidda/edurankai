'use client';

import React from 'react';
import { Menu, ShieldCheck, Database, BookOpen, Plus, UserCheck } from 'lucide-react';

interface TopHeaderProps {
  onMobileToggle: () => void;
  onOpenAddModal: () => void;
  onOpenCourseManager: () => void;
  isDbConfigured: boolean;
}

export function TopHeader({
  onMobileToggle,
  onOpenAddModal,
  onOpenCourseManager,
  isDbConfigured,
}: TopHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-400 font-medium hidden sm:inline">Administration</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-bold text-[#1E1B4B]">Student Enrollment Dashboard</span>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Course Catalog Shortcut */}
        <button
          onClick={onOpenCourseManager}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#6C3BEB]" />
          <span>Courses</span>
        </button>

        {/* Add Student Header Button */}
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#6C3BEB] text-white hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Add Student</span>
        </button>

        {/* Database Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1ECFF] text-[#6C3BEB] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6C3BEB]" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-200 to-indigo-100 text-[#6C3BEB] font-bold text-xs flex items-center justify-center border border-violet-200 shadow-xs">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-[#1E1B4B]">Registrar Admin</div>
            <div className="text-[10px] text-slate-400 font-medium">Academic Portal</div>
          </div>
        </div>
      </div>
    </header>
  );
}
