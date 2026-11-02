import { getSupabaseServerClient, isSupabaseConfigured } from '../supabase/server.ts';
import { Course, CourseInput } from '../types.ts';
import { ServiceResult } from './studentService.ts';

/**
 * Service to manage Academic Course catalog in Supabase PostgreSQL
 */
export class CourseService {
  /**
   * Fetch all courses with enrolled student count
   */
  static async getCourses(): Promise<ServiceResult<Course[]>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    try {
      const supabase = getSupabaseServerClient();
      
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });

      if (coursesError) {
        return {
          success: false,
          error: coursesError.message,
          statusCode: 500,
        };
      }

      // Fetch student count per course for relational visibility
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('course_id');

      const countMap: Record<string, number> = {};
      if (!studentsError && studentsData) {
        studentsData.forEach((s: any) => {
          if (s.course_id) {
            countMap[s.course_id] = (countMap[s.course_id] || 0) + 1;
          }
        });
      }

      const formatted: Course[] = (coursesData || []).map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        department: c.department,
        credit_hours: c.credit_hours,
        created_at: c.created_at,
        updated_at: c.updated_at,
        student_count: countMap[c.id] || 0,
      }));

      return {
        success: true,
        data: formatted,
        statusCode: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to fetch courses.',
        statusCode: 500,
      };
    }
  }

  /**
   * Create a new course
   */
  static async createCourse(input: CourseInput): Promise<ServiceResult<Course>> {
    const code = (input.code || '').trim().toUpperCase();
    const name = (input.name || '').trim();
    const department = (input.department || '').trim();
    const credit_hours = Number(input.credit_hours) || 3;

    if (!code || !name || !department) {
      return {
        success: false,
        error: 'Course code, name, and department are all required.',
        statusCode: 400,
      };
    }

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
        .from('courses')
        .insert({
          code,
          name,
          department,
          credit_hours,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('code')) {
          return {
            success: false,
            isDuplicate: true,
            error: `Course code "${code}" is already in use by another course.`,
            statusCode: 409,
          };
        }
        return {
          success: false,
          error: error.message,
          statusCode: 500,
        };
      }

      return {
        success: true,
        data: { ...data, student_count: 0 },
        statusCode: 201,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to create course.',
        statusCode: 500,
      };
    }
  }

  /**
   * Update an existing course
   */
  static async updateCourse(id: string, input: Partial<CourseInput>): Promise<ServiceResult<Course>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    const updatePayload: Record<string, any> = {};
    if (input.code !== undefined) updatePayload.code = input.code.trim().toUpperCase();
    if (input.name !== undefined) updatePayload.name = input.name.trim();
    if (input.department !== undefined) updatePayload.department = input.department.trim();
    if (input.credit_hours !== undefined) updatePayload.credit_hours = Number(input.credit_hours);

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('courses')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          return {
            success: false,
            isDuplicate: true,
            error: `Course code "${updatePayload.code}" is already in use.`,
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
          error: `Course with ID "${id}" was not found.`,
          statusCode: 404,
        };
      }

      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to update course.',
        statusCode: 500,
      };
    }
  }

  /**
   * Delete a course with relational foreign key protection
   * Enforces RESTRICT constraint: cannot delete a course if students are enrolled
   */
  static async deleteCourse(id: string): Promise<ServiceResult<{ id: string }>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
        statusCode: 503,
      };
    }

    try {
      const supabase = getSupabaseServerClient();

      // Check if any students are currently enrolled in this course
      const { count, error: countError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', id);

      if (countError) {
        return {
          success: false,
          error: countError.message,
          statusCode: 500,
        };
      }

      if (count && count > 0) {
        return {
          success: false,
          error: `Cannot delete course: ${count} student(s) currently enrolled. Please reassign or delete the enrolled students before deleting this course.`,
          statusCode: 400,
        };
      }

      // Safe to delete course
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // In case of foreign key violation
        if (deleteError.code === '23503') {
          return {
            success: false,
            error: 'Cannot delete course: Enrolled students reference this course (Foreign Key constraint RESTRICT).',
            statusCode: 400,
          };
        }
        return {
          success: false,
          error: deleteError.message,
          statusCode: 500,
        };
      }

      return {
        success: true,
        data: { id },
        statusCode: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to delete course.',
        statusCode: 500,
      };
    }
  }
}
