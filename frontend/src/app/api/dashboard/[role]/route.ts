import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  AdminDashboard,
  StudentDashboard,
  TeacherDashboard,
} from "@/features/dashboards/dashboards.types";
import { apiErrorResponse } from "@/shared/api/route-response";

type Dashboard = AdminDashboard | TeacherDashboard | StudentDashboard;
export async function GET(
  _: Request,
  context: { params: Promise<{ role: string }> },
) {
  const { role } = await context.params;
  if (!new Set(["admin", "teacher", "student"]).has(role))
    return Response.json({ title: "Not found", status: 404 }, { status: 404 });
  try {
    return Response.json(
      await authenticatedApiRequest<Dashboard>(
        await cookies(),
        `dashboard/${role}`,
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
