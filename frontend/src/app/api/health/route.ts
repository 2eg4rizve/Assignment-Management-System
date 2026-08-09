import { checkBackendHealth } from "@/shared/api/health";

export async function GET() {
  try {
    const health = await checkBackendHealth();
    return Response.json(health);
  } catch {
    return Response.json(
      {
        message:
          "The frontend is running, but the backend API is unavailable. Check API_BASE_URL and start the backend.",
        status: "unavailable",
      },
      { status: 503 },
    );
  }
}
