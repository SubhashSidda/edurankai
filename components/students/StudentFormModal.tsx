'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Calendar, Phone, Mail, User, BookOpen } from 'lucide-react';
import { Student, StudentInput, Course } from '../../lib/types.ts';
import { validateStudentInput } from '../../lib/validations/student.ts';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentInput, id?: string) => Promise<{ success: boolean; error?: string; isDuplicate?: boolean }>;
  studentToEdit?: Student | null;
  courses: Course[];
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit,
  courses,
}: StudentFormModalProps) {
  const isEditing = Boolean(studentToEdit);

  const [formData, setFormData] = useState<StudentInput>({
    full_name: '',
    email: '',
    phone_number: '',
    course_id: '',
    enrollment_date: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        full_name: studentToEdit.full_name || '',
        email: studentToEdit.email || '',
        phone_number: studentToEdit.phone_number || '',
        course_id: studentToEdit.course_id || '',
        enrollment_date: studentToEdit.enrollment_date || new Date().toISOString().split('T')[0],
        status: studentToEdit.status || 'Active',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        course_id: courses.length > 0 ? courses[0].id : '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }
    setErrors({});
    setServerError(null);
  }, [studentToEdit, isOpen, courses]);

  if (!isOpen) return null;

  const handleChange = (field: keyof StudentInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-Side Validation
    const validation = validateStudentInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const result = await onSubmit(validation.normalizedData!, studentToEdit?.id);
      if (result.success) {
        onClose();
      } else {
        setServerError(result.error || 'Failed to save student record.');
        if (result.isDuplicate) {
          setErrors((prev) => ({
            ...prev,
            email: 'This email is already registered in the system.',
          }));
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] text-[#6C3BEB] flex items-center justify-center">
              {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E1B4B]">
                {isEditing ? 'Edit Student Details' : 'Enroll New Student'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update student information and status' : 'Add a new student to an academic program'}
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Server Error Banner */}
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{serverError}</div>
            </div>
          )}

          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="e.g. Alexander Mitchell"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${
                errors.full_name
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                  : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100'
              }`}
            />
            {errors.full_name && (
              <p className="text-[11px] font-medium text-rose-600">{errors.full_name}</p>
            )}
          </div>

          {/* 2. Email & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@university.edu"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                    : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${
                  errors.phone_number
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                    : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100'
                }`}
              />
              {errors.phone_number && (
                <p className="text-[11px] font-medium text-rose-600">{errors.phone_number}</p>
              )}
            </div>
          </div>

          {/* 3. Course Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Academic Course</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => handleChange('course_id', e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 outline-none transition-all cursor-pointer ${
                errors.course_id
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100'
              }`}
            >
              <option value="" disabled>
                Select a course...
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name} ({course.department}, {course.credit_hours} cr)
                </option>
              ))}
            </select>
            {errors.course_id && (
              <p className="text-[11px] font-medium text-rose-600">{errors.course_id}</p>
            )}
          </div>

          {/* 4. Enrollment Date & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Enrollment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Enrollment Date</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.enrollment_date}
                onChange={(e) => handleChange('enrollment_date', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 outline-none transition-all ${
                  errors.enrollment_date
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:bg-white focus:border-[#6C3BEB] focus:ring-2 focus:ring-violet-100'
                }`}
              />
              {errors.enrollment_date && (
                <p className="text-[11px] font-medium text-rose-600">{errors.enrollment_date}</p>
              )}
            </div>

            {/* Status (Active / Inactive) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Enrollment Status</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleChange('status', 'Active')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    formData.status === 'Active'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ● Active
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('status', 'Inactive')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    formData.status === 'Inactive'
                      ? 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ○ Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
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
                  <span>{isEditing ? 'Save Changes' : 'Confirm Enrollment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
