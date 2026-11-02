import { CourseService } from '../../../lib/services/courseService.ts';
import { validateCourseInput } from '../../../lib/validations/course.ts';

/**
 * Next.js App Router Route Handler: /api/courses
 * 
 * Supports:
 * - GET: List all courses with student counts
 * - POST: Create new course
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await CourseService.getCourses();

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
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal server error while fetching courses.',
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

    const validation = validateCourseInput(body);
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

    const result = await CourseService.createCourse(validation.normalizedData!);

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
        message: 'Course created successfully.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal server error while creating course.',
      },
      { status: 500 }
    );
  }
}
