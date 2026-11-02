import { StudentService } from '../../../../lib/services/studentService.ts';
import { validateStudentInput } from '../../../../lib/validations/student.ts';

/**
 * Next.js App Router Route Handler: /api/students/[id]
 * Compatible with Next.js 15 App Router async params
 */

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const result = await StudentService.getStudentById(id);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.statusCode || 404 }
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
        error: error.message || 'Internal server error.',
      },
      { status: 500 }
    );
  }
}

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

    const validation = validateStudentInput(body);
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const result = await StudentService.updateStudent(id, validation.normalizedData!);

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
        message: 'Student details updated successfully.',
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

    const result = await StudentService.deleteStudent(id);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.statusCode || 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: result.data,
        message: 'Student deleted successfully.',
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
