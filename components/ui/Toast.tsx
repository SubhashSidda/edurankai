'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200 text-slate-800'
              : toast.type === 'error'
              ? 'bg-white border-rose-200 text-slate-800'
              : 'bg-white border-violet-200 text-slate-800'
          }`}
        >
          {toast.type === 'success' && (
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-[#6C3BEB] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-sm font-semibold text-[#1E1B4B]">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
