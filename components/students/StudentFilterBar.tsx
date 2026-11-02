'use client';

import React from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { Course } from '../../lib/types.ts';

interface StudentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  courseId: string;
  onCourseChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  courses: Course[];
  onOpenAddModal: () => void;
  totalFiltered: number;
}

export function StudentFilterBar({
  search,
  onSearchChange,
  courseId,
  onCourseChange,
  status,
  onStatusChange,
  onClearFilters,
  courses,
  onOpenAddModal,
  totalFiltered,
}: StudentFilterBarProps) {
  const hasActiveFilters = Boolean(search.trim() || courseId !== 'all' || status !== 'all');

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by student name or email..."
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100 outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters & Action Buttons */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Course Filter Dropdown */}
        <div className="relative">
          <select
            value={courseId}
            onChange={(e) => onCourseChange(e.target.value)}
            className="pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 hover:bg-white focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100 outline-none appearance-none cursor-pointer transition-all"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
          <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 hover:bg-white focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100 outline-none appearance-none cursor-pointer transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}

        {/* Add Student Primary Action */}
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#6C3BEB] text-white hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 hover:shadow-violet-300 transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>
    </div>
  );
}
