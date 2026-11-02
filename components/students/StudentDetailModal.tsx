'use client';

import React from 'react';
import { X, Mail, Phone, Calendar, BookOpen, Clock, Pencil, User, ShieldCheck } from 'lucide-react';
import { Student } from '../../lib/types.ts';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
  onEdit,
}: StudentDetailModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-[#F1ECFF] to-violet-50/50 border-b border-violet-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#6C3BEB] text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-violet-200">
              {student.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E1B4B]">{student.full_name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {student.status === 'Active' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Enrollment
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Inactive / On Leave
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400 font-mono">ID: {student.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5">
          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                  <Mail className="w-3 h-3 text-[#6C3BEB]" />
                  <span>Email Address</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 break-all select-all">
                  {student.email}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3 text-[#6C3BEB]" />
                  <span>Phone Number</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 font-mono">
                  {student.phone_number}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Academic Track &amp; Program
            </h4>
            <div className="p-4 rounded-xl bg-[#F1ECFF]/40 border border-violet-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1E1B4B]">
                  {student.course?.name || 'Academic Program'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-violet-200 text-[#6C3BEB] text-xs font-bold font-mono">
                  {student.course?.code || 'N/A'}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3">
                <span>Department: <strong>{student.course?.department || 'General'}</strong></span>
                <span>·</span>
                <span>Credits: <strong>{student.course?.credit_hours || 3} Credit Hours</strong></span>
              </div>
            </div>
          </div>

          {/* Enrollment Dates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Enrollment Timeline
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Enrollment Date</span>
                </div>
                <div className="font-semibold text-slate-800 font-mono tabular-nums">
                  {student.enrollment_date}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Database Registered</span>
                </div>
                <div className="font-semibold text-slate-800 font-mono tabular-nums">
                  {student.created_at ? student.created_at.split('T')[0] : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified PostgreSQL record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6C3BEB] text-white hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 transition-all flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
