import { NextResponse } from "next/server";

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001") + "/stats";
  try {
    const res = await fetch(url, { cache: "no-store" });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ totalQueries: 0, queriesLast24h: 0, recentQueries: [] });
  }
}
