import { getSupabaseServerClient, isSupabaseConfigured } from '../supabase/server.ts';
import { Student, StudentInput, StudentFilterParams, DashboardStats } from '../types.ts';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  isDuplicate?: boolean;
  statusCode?: number;
}

/**
 * Service to manage Student records in Supabase PostgreSQL
 */
export class StudentService {
  /**
   * Fetch all students with optional search and filters
   */
  static async getStudents(params: StudentFilterParams = {}): Promise<ServiceResult<Student[]>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.',
        statusCode: 503,
      };
    }

    try {
      const supabase = getSupabaseServerClient();
      let query = supabase
        .from('students')
        .select(`
          id,
          full_name,
          email,
          phone_number,
          course_id,
          enrollment_date,
          status,
          created_at,
          updated_at,
          course:courses (
            id,
            code,
            name,
            department,
            credit_hours
          )
        `)
        .order('created_at', { ascending: false });

      // Apply course filter
      if (params.courseId && params.courseId !== 'all') {
        query = query.eq('course_id', params.courseId);
      }

      // Apply status filter
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      // Apply search across full_name or email (case-insensitive)
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim();
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[StudentService.getStudents] Query error:', error);
        return {
          success: false,
          error: error.message || 'Failed to retrieve students from database.',
          statusCode: 500,
        };
      }

      // Format data and attach course object
      const formattedStudents: Student[] = (data || []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        phone_number: row.phone_number,
        course_id: row.course_id,
        enrollment_date: row.enrollment_date,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        course: Array.isArray(row.course) ? row.course[0] : row.course,
      }));

      return {
        success: true,
        data: formattedStudents,
        statusCode: 200,
      };
    } catch (err: any) {
      console.error('[StudentService.getStudents] Unexpected exception:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while fetching students.',
        statusCode: 500,
      };
    }
  }

  /**
   * Fetch single student by UUID
   */
  static async getStudentById(id: string): Promise<ServiceResult<Student>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          email,
          phone_number,
          course_id,
          enrollment_date,
          status,
          created_at,
          updated_at,
          course:courses (
            id,
            code,
            name,
            department,
            credit_hours
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[StudentService.getStudentById] Query error:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500,
        };
      }

      if (!data) {
        return {
          success: false,
          error: `Student with ID "${id}" was not found.`,
          statusCode: 404,
        };
      }

      const formatted: Student = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        course_id: data.course_id,
        enrollment_date: data.enrollment_date,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        course: Array.isArray(data.course) ? data.course[0] : data.course,
      };

      return {
        success: true,
        data: formatted,
        statusCode: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to retrieve student.',
        statusCode: 500,
      };
    }
  }

  /**
   * Create a new student record in PostgreSQL
   * Enforces case-insensitive unique email and valid course foreign key
   */
  static async createStudent(input: StudentInput): Promise<ServiceResult<Student>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    const supabase = getSupabaseServerClient();
    const normalizedEmail = input.email.trim().toLowerCase();

    try {
      // 1. Verify foreign key: Check that the course exists in the database
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, name')
        .eq('id', input.course_id)
        .maybeSingle();

      if (courseError) {
        console.error('[StudentService.createStudent] Course check error:', courseError);
        return {
          success: false,
          error: 'Failed to verify course selection.',
          statusCode: 500,
        };
      }

      if (!courseData) {
        return {
          success: false,
          error: `Invalid course: Course with ID "${input.course_id}" does not exist.`,
          statusCode: 400,
        };
      }

      // 2. Perform insert into students table
      const { data, error } = await supabase
        .from('students')
        .insert({
          full_name: input.full_name.trim(),
          email: normalizedEmail,
          phone_number: input.phone_number.trim(),
          course_id: input.course_id,
          enrollment_date: input.enrollment_date,
          status: input.status,
        })
        .select(`
          id,
          full_name,
          email,
          phone_number,
          course_id,
          enrollment_date,
          status,
          created_at,
          updated_at,
          course:courses (
            id,
            code,
            name,
            department,
            credit_hours
          )
        `)
        .single();

      if (error) {
        // PostgreSQL unique violation error code is 23505
        if (error.code === '23505' || error.message.toLowerCase().includes('unique') || error.message.includes('students_email')) {
          return {
            success: false,
            isDuplicate: true,
            error: `A student with the email address "${normalizedEmail}" is already enrolled in the system.`,
            statusCode: 409,
          };
        }

        // Foreign key constraint violation error code is 23503
        if (error.code === '23503') {
          return {
            success: false,
            error: 'The selected course does not exist in the database.',
            statusCode: 400,
          };
        }

        console.error('[StudentService.createStudent] Insert error:', error);
        return {
          success: false,
          error: error.message || 'Database insert failed.',
          statusCode: 500,
        };
      }

      const formatted: Student = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        course_id: data.course_id,
        enrollment_date: data.enrollment_date,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        course: Array.isArray(data.course) ? data.course[0] : data.course,
      };

      return {
        success: true,
        data: formatted,
        statusCode: 201,
      };
    } catch (err: any) {
      console.error('[StudentService.createStudent] Unexpected exception:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while creating the student.',
        statusCode: 500,
      };
    }
  }

  /**
   * Update student details by ID
   */
  static async updateStudent(id: string, input: Partial<StudentInput>): Promise<ServiceResult<Student>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    const supabase = getSupabaseServerClient();
    const updatePayload: Record<string, any> = {};

    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.email !== undefined) updatePayload.email = input.email.trim().toLowerCase();
    if (input.phone_number !== undefined) updatePayload.phone_number = input.phone_number.trim();
    if (input.course_id !== undefined) updatePayload.course_id = input.course_id;
    if (input.enrollment_date !== undefined) updatePayload.enrollment_date = input.enrollment_date;
    if (input.status !== undefined) updatePayload.status = input.status;

    try {
      // If course_id is being updated, verify it exists
      if (input.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('id')
          .eq('id', input.course_id)
          .maybeSingle();

        if (!courseData) {
          return {
            success: false,
            error: `Course with ID "${input.course_id}" does not exist.`,
            statusCode: 400,
          };
        }
      }

      const { data, error } = await supabase
        .from('students')
        .update(updatePayload)
        .eq('id', id)
        .select(`
          id,
          full_name,
          email,
          phone_number,
          course_id,
          enrollment_date,
          status,
          created_at,
          updated_at,
          course:courses (
            id,
            code,
            name,
            department,
            credit_hours
          )
        `)
        .maybeSingle();

      if (error) {
        if (error.code === '23505' || error.message.toLowerCase().includes('unique') || error.message.includes('students_email')) {
          return {
            success: false,
            isDuplicate: true,
            error: `Another student is already registered with email "${updatePayload.email}".`,
            statusCode: 409,
          };
        }
        return {
          success: false,
          error: error.message,
          statusCode: 500,
        };
      }

      if (!data) {
        return {
          success: false,
          error: `Student with ID "${id}" was not found.`,
          statusCode: 404,
        };
      }

      const formatted: Student = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        course_id: data.course_id,
        enrollment_date: data.enrollment_date,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        course: Array.isArray(data.course) ? data.course[0] : data.course,
      };

      return {
        success: true,
        data: formatted,
        statusCode: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to update student.',
        statusCode: 500,
      };
    }
  }

  /**
   * Delete student by ID
   */
  static async deleteStudent(id: string): Promise<ServiceResult<{ id: string }>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: error.message,
          statusCode: 500,
        };
      }

      if (!data) {
        return {
          success: false,
          error: `Student with ID "${id}" does not exist or was already deleted.`,
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: { id: data.id },
        statusCode: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to delete student.',
        statusCode: 500,
      };
    }
  }

  /**
   * Fetch aggregate student metrics for the dashboard
   */
  static async getStats(): Promise<ServiceResult<DashboardStats>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    try {
      const supabase = getSupabaseServerClient();

      const [totalRes, activeRes, inactiveRes, coursesRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Inactive'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (activeRes.error) throw activeRes.error;
      if (inactiveRes.error) throw inactiveRes.error;
      if (coursesRes.error) throw coursesRes.error;

      const stats: DashboardStats = {
        totalStudents: totalRes.count || 0,
        activeStudents: activeRes.count || 0,
        inactiveStudents: inactiveRes.count || 0,
        totalCourses: coursesRes.count || 0,
      };

      return {
        success: true,
        data: stats,
        statusCode: 200,
      };
    } catch (err: any) {
      console.error('[StudentService.getStats] Error:', err);
      return {
        success: false,
        error: err.message || 'Failed to calculate database statistics.',
        statusCode: 500,
      };
    }
  }

  /**
   * Alias for getStats() to ensure compatibility with API route handlers
   */
  static async getDashboardStats(): Promise<ServiceResult<DashboardStats>> {
    return this.getStats();
  }
}
