import { getTokenCookie } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

export async function POST(request: Request) {
  const token = await getTokenCookie();
  if (!token) {
    return Response.json({ message: "Please log in to use the MealNest Assistant." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: body?.message }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({ message: "The MealNest Assistant returned an invalid response." }));
    return Response.json(data, { status: response.status });
  } catch {
    return Response.json({ message: "Unable to contact the MealNest Assistant." }, { status: 502 });
  }
}
