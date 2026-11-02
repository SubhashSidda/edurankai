'use client';

import React from 'react';
import { Users, UserCheck, UserX, BookOpen, RefreshCw } from 'lucide-react';
import { DashboardStats } from '../../lib/types.ts';

interface StatCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  onRefresh: () => void;
}

export function StatCards({ stats, loading, onRefresh }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Students Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] text-[#6C3BEB] flex items-center justify-center transition-transform group-hover:scale-105">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            All Records
          </span>
        </div>
        <div className="text-xs font-medium text-slate-500">Total Students</div>
        <div className="mt-1 flex items-baseline gap-2">
          {loading && !stats ? (
            <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <span className="text-3xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
              {stats?.totalStudents ?? 0}
            </span>
          )}
          <span className="text-xs text-slate-400">enrolled</span>
        </div>
      </div>

      {/* 2. Active Students Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
            <UserCheck className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            In Good Standing
          </span>
        </div>
        <div className="text-xs font-medium text-slate-500">Active Students</div>
        <div className="mt-1 flex items-baseline gap-2">
          {loading && !stats ? (
            <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <span className="text-3xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
              {stats?.activeStudents ?? 0}
            </span>
          )}
          <span className="text-xs text-emerald-600 font-medium">
            {stats && stats.totalStudents > 0
              ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}%`
              : '0%'}
          </span>
        </div>
      </div>

      {/* 3. Inactive Students Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-105">
            <UserX className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-amber-600">
            Paused / Leave
          </span>
        </div>
        <div className="text-xs font-medium text-slate-500">Inactive Students</div>
        <div className="mt-1 flex items-baseline gap-2">
          {loading && !stats ? (
            <div className="h-9 w-14 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <span className="text-3xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
              {stats?.inactiveStudents ?? 0}
            </span>
          )}
          <span className="text-xs text-slate-400">on leave</span>
        </div>
      </div>

      {/* 4. Total Courses Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-[#6C3BEB] flex items-center justify-center transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5" />
          </div>
          <button
            onClick={onRefresh}
            title="Refresh database metrics"
            className="p-1 rounded-lg text-slate-400 hover:text-[#6C3BEB] hover:bg-violet-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-xs font-medium text-slate-500">Academic Courses</div>
        <div className="mt-1 flex items-baseline gap-2">
          {loading && !stats ? (
            <div className="h-9 w-12 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <span className="text-3xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
              {stats?.totalCourses ?? 0}
            </span>
          )}
          <span className="text-xs text-slate-400">tracks</span>
        </div>
      </div>
    </div>
  );
}
