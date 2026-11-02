'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Student } from '../../lib/types.ts';

interface DeleteConfirmModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function DeleteConfirmModal({
  student,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await onConfirm(student.id);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to delete student.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-[#1E1B4B]">Delete Student Record?</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            This will permanently remove <strong>{student.full_name}</strong> ({student.email}) from the database. This action cannot be undone.
          </p>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Program:</span>
              <strong className="text-slate-800">{student.course?.name || 'Assigned Course'}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status:</span>
              <strong className={student.status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}>
                {student.status}
              </strong>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
