import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const { rows } = await sql`
      SELECT t.*, a.name as agent_name, a.emoji as agent_emoji
      FROM tasks t
      LEFT JOIN agents a ON t.agent_id = a.id
      ORDER BY t.created_at DESC
      LIMIT 50
    `;
    return NextResponse.json(rows);
  } catch (e) {
    console.error("Failed to fetch tasks:", e);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  await initDb();
  const body = await request.json();
  const { name, description, agent_id, assigned_by } = body;

  const { rows } = await sql`
    INSERT INTO tasks (name, description, agent_id, assigned_by, status, started_at)
    VALUES (${name}, ${description}, ${agent_id}, ${assigned_by}, 'pending', NOW())
    RETURNING *
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
