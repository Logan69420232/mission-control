import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  await initDb();
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  const count = await sql`SELECT COUNT(*) as count FROM agents`;
  return NextResponse.json({ 
    tables: tables.rows.map((r: {table_name: string}) => r.table_name), 
    agent_count: count.rows[0].count,
    postgres_url_set: !!process.env.POSTGRES_URL
  });
}
