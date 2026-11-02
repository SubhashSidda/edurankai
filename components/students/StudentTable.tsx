'use client';

import React from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  UserX,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Student } from '../../lib/types.ts';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  error: string | null;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onOpenAddModal: () => void;
  onRetry: () => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function StudentTable({
  students,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onOpenAddModal,
  onRetry,
  hasFilters,
  onClearFilters,
}: StudentTableProps) {
  // 1. Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Failed to Load Students</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // 2. Loading Skeleton State
  if (loading && students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 bg-slate-100 rounded animate-pulse hidden md:block" />
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse hidden sm:block" />
              <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Empty State (No records at all or no matching filters)
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#F1ECFF] text-[#6C3BEB] mx-auto flex items-center justify-center mb-4">
          <UserCheck className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-[#1E1B4B]">
          {hasFilters ? 'No Matching Students Found' : 'No Students Enrolled Yet'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {hasFilters
            ? 'Try adjusting your search keywords, course selection, or status filters.'
            : 'Get started by enrolling your first student into an academic program.'}
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          {hasFilters ? (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-[#6C3BEB] text-white rounded-xl text-xs font-semibold hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll First Student</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Helper for generating deterministic avatar background colors based on student name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-violet-100 text-[#6C3BEB]',
      'bg-indigo-100 text-indigo-700',
      'bg-purple-100 text-purple-700',
      'bg-sky-100 text-sky-700',
      'bg-emerald-100 text-emerald-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper for 2-letter initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // 4. Populated Table
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Table Header Summary */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1E1B4B]">Enrolled Students</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono font-semibold">
            {students.length}
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Showing real-time records from PostgreSQL
        </div>
      </div>

      {/* Table Responsive Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-6">Student</th>
              <th className="py-3 px-6 hidden sm:table-cell">Contact</th>
              <th className="py-3 px-6">Course</th>
              <th className="py-3 px-6 hidden md:table-cell">Enrolled Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => {
              const initials = getInitials(student.full_name);
              const avatarClass = getAvatarColor(student.full_name);

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Name & Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${avatarClass}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1E1B4B] truncate">
                          {student.full_name}
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 sm:hidden">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info (Email & Phone) */}
                  <td className="py-4 px-6 hidden sm:table-cell">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.phone_number}</span>
                      </div>
                    </div>
                  </td>

                  {/* Course Info */}
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-slate-800 text-xs">
                        {student.course?.name || 'Assigned Track'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {student.course?.code || 'GEN-01'} · {student.course?.credit_hours || 3} Credit Hours
                      </div>
                    </div>
                  </td>

                  {/* Enrollment Date */}
                  <td className="py-4 px-6 hidden md:table-cell">
                    <div className="text-xs text-slate-600 font-mono tabular-nums flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{student.enrollment_date}</span>
                    </div>
                  </td>

                  {/* Status (Zero-Pill Typographic Marker) */}
                  <td className="py-4 px-6">
                    {student.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Button */}
                      <button
                        onClick={() => onView(student)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C3BEB] hover:bg-violet-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(student)}
                        title="Edit Student"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(student)}
                        title="Delete Student"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
