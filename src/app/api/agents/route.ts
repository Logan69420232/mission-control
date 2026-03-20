import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await initDb();
  const { rows } = await sql`SELECT * FROM agents ORDER BY id`;
  return NextResponse.json(rows);
}
