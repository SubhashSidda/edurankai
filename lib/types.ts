/**
 * Type definitions for Student Management & Enrollment System
 */

export type StudentStatus = 'Active' | 'Inactive';

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credit_hours: number;
  created_at?: string;
  updated_at?: string;
  student_count?: number;
}

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  course_id: string;
  enrollment_date: string;
  status: StudentStatus;
  created_at?: string;
  updated_at?: string;
  course?: Course;
}

export interface StudentInput {
  full_name: string;
  email: string;
  phone_number: string;
  course_id: string;
  enrollment_date: string;
  status: StudentStatus;
}

export interface CourseInput {
  code: string;
  name: string;
  department: string;
  credit_hours: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalCourses: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  message?: string;
}

export interface StudentFilterParams {
  search?: string;
  courseId?: string;
  status?: string;
}
