'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  BookOpen,
  Plus,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Student, Course, DashboardStats, StudentInput, CourseInput } from '../lib/types.ts';
import { Sidebar } from '../components/layout/Sidebar.tsx';
import { TopHeader } from '../components/layout/TopHeader.tsx';
import { StatCards } from '../components/dashboard/StatCards.tsx';
import { StudentFilterBar } from '../components/students/StudentFilterBar.tsx';
import { StudentTable } from '../components/students/StudentTable.tsx';
import { StudentFormModal } from '../components/students/StudentFormModal.tsx';
import { StudentDetailModal } from '../components/students/StudentDetailModal.tsx';
import { DeleteConfirmModal } from '../components/students/DeleteConfirmModal.tsx';
import { CourseManagementModal } from '../components/courses/CourseManagementModal.tsx';
import { ToastContainer, ToastMessage } from '../components/ui/Toast.tsx';

export default function StudentManagementDashboard() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'students' | 'courses' | 'database'>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Loading & Error States
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [isDbConfigured, setIsDbConfigured] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [isCourseManagerOpen, setIsCourseManagerOpen] = useState(false);

  // Client Mounting Guard
  const [isMounted, setIsMounted] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Safe response JSON parser to prevent "Unexpected token '<'" on non-JSON error pages
  const safeParseJson = async (res: Response) => {
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  // 1. Fetch Configuration Status
  const fetchConfigStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/config-status');
      const data = await safeParseJson(res);
      if (data && data.success) {
        setIsDbConfigured(data.data.isConfigured);
        setSupabaseUrl(data.data.supabaseUrl);
      }
    } catch (err) {
      console.warn('Config status check failed:', err);
    }
  }, []);

  // 2. Fetch Courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await safeParseJson(res);
      if (data && data.success && Array.isArray(data.data)) {
        setCourses(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch courses:', err);
    }
  }, []);

  // 3. Fetch Dashboard Stats (Calculated dynamically from real Supabase records)
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      const data = await safeParseJson(res);
      if (data && data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 4. Fetch Students with search & filters
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    setStudentsError(null);

    const queryParams = new URLSearchParams();
    if (search.trim()) queryParams.set('search', search.trim());
    if (selectedCourseId !== 'all') queryParams.set('courseId', selectedCourseId);
    if (selectedStatus !== 'all') queryParams.set('status', selectedStatus);

    try {
      const res = await fetch(`/api/students?${queryParams.toString()}`);
      const data = await safeParseJson(res);

      if (data && data.success && Array.isArray(data.data)) {
        setStudents(data.data);
      } else {
        setStudentsError(data?.error || 'Database connection required. Please configure Supabase in .env.');
      }
    } catch (err: any) {
      setStudentsError(err.message || 'An unexpected error occurred while fetching students.');
    } finally {
      setLoadingStudents(false);
    }
  }, [search, selectedCourseId, selectedStatus]);

  // Initial Load
  useEffect(() => {
    setIsMounted(true);
    fetchConfigStatus();
    fetchCourses();
    fetchStats();
  }, [fetchConfigStatus, fetchCourses, fetchStats]);

  // Debounced / Triggered student fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCourseId('all');
    setSelectedStatus('all');
  };

  // Student Actions: Add / Edit
  const handleSaveStudent = async (data: StudentInput, id?: string) => {
    try {
      const url = id ? `/api/students/${id}` : '/api/students';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await safeParseJson(res);

      if (res.ok && result?.success) {
        addToast(
          'success',
          id ? 'Student Details Updated' : 'Student Enrolled Successfully',
          `${data.full_name} (${data.email}) record saved.`
        );
        fetchStudents();
        fetchStats();
        return { success: true };
      } else {
        return {
          success: false,
          error: result?.error || 'Database operation failed.',
          isDuplicate: result?.isDuplicate || false,
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Student Actions: Delete
  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      const result = await safeParseJson(res);

      if (res.ok && result?.success) {
        addToast('success', 'Student Record Deleted', 'The student was removed from the database.');
        fetchStudents();
        fetchStats();
        return { success: true };
      } else {
        return { success: false, error: result?.error || 'Failed to delete student.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Course Actions: Add Course
  const handleAddCourse = async (courseData: CourseInput) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      const result = await safeParseJson(res);

      if (res.ok && result?.success) {
        addToast('success', 'Course Added', `${courseData.name} (${courseData.code}) added to catalog.`);
        fetchCourses();
        fetchStats();
        return { success: true };
      } else {
        return { success: false, error: result?.error || 'Failed to add course.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Course Actions: Update Course
  const handleUpdateCourse = async (id: string, courseData: Partial<CourseInput>) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      const result = await safeParseJson(res);

      if (res.ok && result?.success) {
        addToast('success', 'Course Updated', 'Course details updated.');
        fetchCourses();
        return { success: true };
      } else {
        return { success: false, error: result?.error || 'Failed to update course.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Course Actions: Delete Course with RESTRICT check
  const handleDeleteCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      const result = await safeParseJson(res);

      if (res.ok && result?.success) {
        addToast('success', 'Course Deleted', 'Course successfully removed from catalog.');
        fetchCourses();
        fetchStats();
        return { success: true };
      } else {
        return {
          success: false,
          error: result?.error || 'Cannot delete course: Students may be actively enrolled.',
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Copy SQL Schema helper
  const copySqlSchema = () => {
    const sqlText = `-- EduRankAI Student Management & Enrollment System (PostgreSQL / Supabase Schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    credit_hours INTEGER NOT NULL DEFAULT 3 CHECK (credit_hours > 0 AND credit_hours <= 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS students_email_lower_unique ON students (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_students_full_name_trgm ON students USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_students_email_trgm ON students USING gin (email gin_trgm_ops);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    addToast('info', 'Schema Copied', 'SQL schema has been copied to your clipboard.');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col md:flex-row font-sans" suppressHydrationWarning>
        {/* Skeleton Sidebar */}
        <div className="w-64 bg-white border-r border-slate-100 hidden md:block shrink-0 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-16 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-9 bg-slate-50 rounded-xl animate-pulse" />
            <div className="h-9 bg-slate-50 rounded-xl animate-pulse" />
            <div className="h-9 bg-slate-50 rounded-xl animate-pulse" />
            <div className="h-9 bg-slate-50 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Skeleton Canvas */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <div className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between">
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
            <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
          </div>
          <div className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
            <div className="h-32 bg-violet-50/50 rounded-2xl border border-violet-100 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-white border border-slate-100 rounded-2xl p-5 animate-pulse" />
              <div className="h-28 bg-white border border-slate-100 rounded-2xl p-5 animate-pulse" />
              <div className="h-28 bg-white border border-slate-100 rounded-2xl p-5 animate-pulse" />
              <div className="h-28 bg-white border border-slate-100 rounded-2xl p-5 animate-pulse" />
            </div>
            <div className="h-72 bg-white border border-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col md:flex-row font-sans" suppressHydrationWarning>
      {/* 1. White Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'courses') {
            setIsCourseManagerOpen(true);
          }
        }}
        isDbConfigured={isDbConfigured}
        supabaseUrl={supabaseUrl}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onOpenCourseManager={() => setIsCourseManagerOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header Navigation */}
        <TopHeader
          onMobileToggle={() => setMobileSidebarOpen(true)}
          onOpenAddModal={() => {
            setStudentToEdit(null);
            setIsAddEditModalOpen(true);
          }}
          onOpenCourseManager={() => setIsCourseManagerOpen(true)}
          isDbConfigured={isDbConfigured}
        />

        {/* Dashboard Main Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-50/70 via-white to-purple-50/30 border border-violet-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#6C3BEB] text-white text-[11px] font-bold tracking-wide uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                Registrar Console
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] tracking-tight">
                Welcome back, Administrator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Manage student admissions, track enrollments, and configure academic degree paths in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsCourseManagerOpen(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-[#6C3BEB]" />
                <span>Manage Courses</span>
              </button>
              <button
                onClick={() => {
                  setStudentToEdit(null);
                  setIsAddEditModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#6C3BEB] text-white hover:bg-[#5A2ED6] shadow-sm shadow-violet-200 hover:shadow-violet-300 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* 3 Dynamic Statistic Cards (Calculated from Real Database Records) */}
          <StatCards
            stats={stats}
            loading={loadingStats}
            onRefresh={() => {
              fetchStats();
              fetchStudents();
              addToast('info', 'Metrics Refreshed', 'Synced with PostgreSQL database.');
            }}
          />

          {/* Student Management Directory */}
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <StudentFilterBar
              search={search}
              onSearchChange={setSearch}
              courseId={selectedCourseId}
              onCourseChange={setSelectedCourseId}
              status={selectedStatus}
              onStatusChange={setSelectedStatus}
              onClearFilters={handleClearFilters}
              courses={courses}
              onOpenAddModal={() => {
                setStudentToEdit(null);
                setIsAddEditModalOpen(true);
              }}
              totalFiltered={students.length}
            />

            {/* Students Table with Loading Skeleton, Empty and Error States */}
            <StudentTable
              students={students}
              loading={loadingStudents}
              error={studentsError}
              onView={(s) => {
                setStudentToView(s);
                setIsDetailModalOpen(true);
              }}
              onEdit={(s) => {
                setStudentToEdit(s);
                setIsAddEditModalOpen(true);
              }}
              onDelete={(s) => {
                setStudentToDelete(s);
                setIsDeleteModalOpen(true);
              }}
              onOpenAddModal={() => {
                setStudentToEdit(null);
                setIsAddEditModalOpen(true);
              }}
              onRetry={() => {
                fetchStudents();
                fetchStats();
              }}
              hasFilters={Boolean(search.trim() || selectedCourseId !== 'all' || selectedStatus !== 'all')}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* PostgreSQL Database Blueprint Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1E1B4B]">
                  Supabase PostgreSQL Setup &amp; Relational Schema
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Foreign key <code className="text-violet-700 font-mono text-[11px]">course_id REFERENCES courses(id) ON DELETE RESTRICT</code> and case-insensitive unique email index.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySqlSchema}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-50 text-[#6C3BEB] hover:bg-violet-100 transition-colors flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Schema Copied!' : 'Copy schema.sql'}</span>
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                <div className="font-bold text-[#6C3BEB]">1. Run schema.sql in Supabase</div>
                <p className="text-slate-500 leading-relaxed">
                  Open your Supabase SQL editor and execute <code className="text-violet-700 font-mono">supabase/schema.sql</code> to create the tables with unique indexes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                <div className="font-bold text-[#6C3BEB]">2. Set Server Secrets</div>
                <p className="text-slate-500 leading-relaxed">
                  Add <code className="text-violet-700 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-violet-700 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to your environment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                <div className="font-bold text-[#6C3BEB]">3. Deploy to Vercel</div>
                <p className="text-slate-500 leading-relaxed">
                  Push your repository to GitHub and link to Vercel with standard Next.js App Router settings.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Student Modal */}
      {/* Modals & Toasts (Rendered once mounted on client to prevent any SSR mismatch) */}
      {isMounted && (
        <>
          {/* Add / Edit Student Modal */}
          <StudentFormModal
            isOpen={isAddEditModalOpen}
            onClose={() => {
              setIsAddEditModalOpen(false);
              setStudentToEdit(null);
            }}
            onSubmit={handleSaveStudent}
            studentToEdit={studentToEdit}
            courses={courses}
          />

          {/* View Student Details Modal */}
          <StudentDetailModal
            student={studentToView}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setStudentToView(null);
            }}
            onEdit={(s) => {
              setStudentToEdit(s);
              setIsAddEditModalOpen(true);
            }}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            student={studentToDelete}
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setStudentToDelete(null);
            }}
            onConfirm={handleDeleteStudent}
          />

          {/* Course Catalog Management Modal */}
          <CourseManagementModal
            isOpen={isCourseManagerOpen}
            onClose={() => setIsCourseManagerOpen(false)}
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onRefresh={() => {
              fetchCourses();
              fetchStudents();
              fetchStats();
            }}
          />

          {/* Floating Toast Notification Container */}
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </>
      )}
    </div>
  );
}
