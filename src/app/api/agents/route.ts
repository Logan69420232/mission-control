import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const { rows } = await sql`SELECT * FROM agents ORDER BY id`;
    return NextResponse.json(rows);
  } catch (e) {
    console.error("Failed to fetch agents:", e);
    return NextResponse.json([]);
  }
}
