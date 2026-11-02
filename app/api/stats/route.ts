import { StudentService } from '../../../lib/services/studentService.ts';

/**
 * Next.js App Router Route Handler: /api/stats
 * 
 * Computes live aggregate statistics directly from Supabase PostgreSQL records:
 * - totalStudents
 * - activeStudents
 * - inactiveStudents
 * - totalCourses
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await StudentService.getDashboardStats();

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
        error: error.message || 'Internal server error while fetching dashboard statistics.',
      },
      { status: 500 }
    );
  }
}
