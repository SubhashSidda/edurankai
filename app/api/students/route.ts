import { StudentService } from '../../../lib/services/studentService.ts';
import { validateStudentInput } from '../../../lib/validations/student.ts';

/**
 * Next.js App Router Route Handler: /api/students
 * 
 * Supports:
 * - GET: List students with search (name/email), course filter, and status filter
 * - POST: Create new student with server-side validation and unique email enforcement
 */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const courseId = url.searchParams.get('courseId') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const result = await StudentService.getStudents({ search, courseId, status });

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.statusCode || 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: result.data,
        count: result.data?.length || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal server error while fetching students.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Invalid JSON request payload.',
        },
        { status: 400 }
      );
    }

    // 1. Server-side validation
    const validation = validateStudentInput(body);
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed. Please correct the highlighted errors.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // 2. Database insertion via Supabase PostgreSQL
    const result = await StudentService.createStudent(validation.normalizedData!);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error,
          isDuplicate: result.isDuplicate || false,
        },
        { status: result.statusCode || 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: result.data,
        message: 'Student enrolled successfully.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal server error while creating student.',
      },
      { status: 500 }
    );
  }
}
