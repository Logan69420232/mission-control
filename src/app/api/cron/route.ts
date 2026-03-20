import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await initDb();
  const { rows } = await sql`
    SELECT c.*, a.name as agent_name, a.emoji as agent_emoji
    FROM cron_jobs c
    LEFT JOIN agents a ON c.agent_id = a.id
    ORDER BY c.id
  `;
  return NextResponse.json(rows);
}
