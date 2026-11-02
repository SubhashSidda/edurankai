'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  Award,
  Save,
} from 'lucide-react';
import { Course, CourseInput } from '../../lib/types.ts';
import { validateCourseInput } from '../../lib/validations/course.ts';

interface CourseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onAddCourse: (data: CourseInput) => Promise<{ success: boolean; error?: string }>;
  onUpdateCourse: (id: string, data: Partial<CourseInput>) => Promise<{ success: boolean; error?: string }>;
  onDeleteCourse: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

export function CourseManagementModal({
  isOpen,
  onClose,
  courses,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onRefresh,
}: CourseManagementModalProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form fields
  const [formData, setFormData] = useState<CourseInput>({
    code: '',
    name: '',
    department: '',
    credit_hours: 3,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const openCreateMode = () => {
    setFormData({ code: '', name: '', department: '', credit_hours: 3 });
    setFormErrors({});
    setActionError(null);
    setActionSuccess(null);
    setMode('create');
  };

  const openEditMode = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      department: course.department,
      credit_hours: course.credit_hours,
    });
    setFormErrors({});
    setActionError(null);
    setActionSuccess(null);
    setMode('edit');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCourseInput(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      if (mode === 'create') {
        const res = await onAddCourse(validation.normalizedData!);
        if (res.success) {
          setActionSuccess(`Course "${validation.normalizedData!.name}" created successfully.`);
          setMode('list');
          onRefresh();
        } else {
          setActionError(res.error || 'Failed to create course.');
        }
      } else if (mode === 'edit' && editingCourse) {
        const res = await onUpdateCourse(editingCourse.id, validation.normalizedData!);
        if (res.success) {
          setActionSuccess(`Course "${validation.normalizedData!.name}" updated successfully.`);
          setMode('list');
          onRefresh();
        } else {
          setActionError(res.error || 'Failed to update course.');
        }
      }
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course: Course) => {
    setActionError(null);
    setActionSuccess(null);
    setDeletingId(course.id);

    try {
      const res = await onDeleteCourse(course.id);
      if (res.success) {
        setActionSuccess(`Course "${course.name}" removed successfully.`);
        onRefresh();
      } else {
        // Displays helpful message if students are enrolled
        setActionError(res.error || 'Failed to delete course.');
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] text-[#6C3BEB] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E1B4B]">Course Catalog Management</h3>
              <p className="text-xs text-slate-500">
                Manage academic degree tracks, department credits, and enrollment constraints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {actionError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{actionError}</div>
          </div>
        )}

        {actionSuccess && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{actionSuccess}</div>
          </div>
        )}

        {/* Mode: List View */}
        {mode === 'list' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Courses ({courses.length})
              </div>
              <button
                onClick={openCreateMode}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#6C3BEB] text-white hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Course</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {courses.map((course) => {
                const enrolledCount = course.student_count || 0;
                const isDeleting = deletingId === course.id;

                return (
                  <div
                    key={course.id}
                    className="p-4 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#F1ECFF] text-[#6C3BEB] text-xs font-mono font-bold">
                          {course.code}
                        </span>
                        <h4 className="text-sm font-semibold text-[#1E1B4B] truncate">
                          {course.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{course.department}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-slate-400" />
                          <span>{course.credit_hours} Credit Hours</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Users className="w-3 h-3 text-violet-500" />
                          <span>{enrolledCount} {enrolledCount === 1 ? 'student' : 'students'} enrolled</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditMode(course)}
                        title="Edit Course"
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        disabled={isDeleting}
                        title={enrolledCount > 0 ? "Cannot delete course with enrolled students" : "Delete Course"}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode: Create or Edit Form */}
        {(mode === 'create' || mode === 'edit') && (
          <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6C3BEB]">
              {mode === 'create' ? 'Create Course Definition' : `Editing Course: ${editingCourse?.code}`}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Course Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Course Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g. CS-202"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm uppercase font-mono ${
                    formErrors.code ? 'border-rose-300' : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB]'
                  }`}
                />
                {formErrors.code && <p className="text-[11px] text-rose-600">{formErrors.code}</p>}
              </div>

              {/* Credit Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Credit Hours *</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.credit_hours}
                  onChange={(e) => setFormData((prev) => ({ ...prev, credit_hours: Number(e.target.value) }))}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                    formErrors.credit_hours ? 'border-rose-300' : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB]'
                  }`}
                />
                {formErrors.credit_hours && <p className="text-[11px] text-rose-600">{formErrors.credit_hours}</p>}
              </div>
            </div>

            {/* Course Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Course Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Distributed Cloud Computing"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                  formErrors.name ? 'border-rose-300' : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB]'
                }`}
              />
              {formErrors.name && <p className="text-[11px] text-rose-600">{formErrors.name}</p>}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Department *</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g. Computer Science & Engineering"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                  formErrors.department ? 'border-rose-300' : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB]'
                }`}
              />
              {formErrors.department && <p className="text-[11px] text-rose-600">{formErrors.department}</p>}
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMode('list')}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back to Courses
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#6C3BEB] text-white hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{mode === 'create' ? 'Create Course' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer (List mode) */}
        {mode === 'list' && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[11px] text-slate-400">
              Foreign key RESTRICT protection prevents deleting courses with enrolled students
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
