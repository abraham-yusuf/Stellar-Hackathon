import { NextResponse } from "next/server";

export async function GET() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

  try {
    const res = await fetch(`${serverUrl}/stats`, { cache: "no-store" });
    const data = (await res.json()) as unknown;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ totalQueries: 0, queriesLast24h: 0, recentQueries: [] });
  }
}
