import { getTokenCookie } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";
const VALID_RANGES = new Set(["7d", "30d", "6m"]);

export async function GET(request: Request) {
  const token = await getTokenCookie();
  if (!token) {
    return Response.json({ message: "Authorization token is required" }, { status: 401 });
  }

  const range = new URL(request.url).searchParams.get("range") || "7d";
  if (!VALID_RANGES.has(range)) {
    return Response.json({ message: "Analytics range must be one of: 7d, 30d, 6m." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/analytics?${new URLSearchParams({ range })}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const data = await response.json().catch(() => ({ message: "The analytics API returned an invalid response." }));
    return Response.json(data, { status: response.status });
  } catch {
    return Response.json({ message: "Unable to contact the analytics API." }, { status: 502 });
  }
}
