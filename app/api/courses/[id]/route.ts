import { CourseService } from '../../../../lib/services/courseService.ts';

/**
 * Next.js App Router Route Handler: /api/courses/[id]
 * Compatible with Next.js 15 App Router async params
 */

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

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

    const result = await CourseService.updateCourse(id, body);

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
        message: 'Course updated successfully.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal server error.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const result = await CourseService.deleteCourse(id);

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
        message: 'Course deleted successfully.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
