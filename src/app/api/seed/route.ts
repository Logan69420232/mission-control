import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await initDb();

    await sql`DELETE FROM model_usage`;
    await sql`DELETE FROM cron_jobs`;
    await sql`DELETE FROM tasks`;
    await sql`DELETE FROM agents`;

    await sql`
      INSERT INTO agents (name, emoji, model, status, current_task, current_task_assigned_by, session_tokens_used, week_tokens_used)
      VALUES ('John Snow', '❄️', 'anthropic/claude-sonnet-4-6', 'active', 'Managing NF Supplements operations', 'Logan King', 0, 0)
    `;
    await sql`
      INSERT INTO agents (name, emoji, model, status, current_task, current_task_assigned_by, session_tokens_used, week_tokens_used)
      VALUES ('Larry Brain', '🧠', 'anthropic/claude-sonnet-4-6', 'idle', NULL, NULL, 0, 0)
    `;

    await sql`INSERT INTO cron_jobs (name, schedule, schedule_human, last_run_status) VALUES ('Daily Analytics Report', '0 7 * * *', 'Daily at 7:00 AM UK', 'success')`;
    await sql`INSERT INTO cron_jobs (name, schedule, schedule_human, last_run_status) VALUES ('Overnight TikTok Queue', '0 23 * * *', 'Daily at 11:00 PM UK', NULL)`;

    // Read back immediately to verify
    const { rows } = await sql`SELECT id, name, status FROM agents ORDER BY id`;
    return NextResponse.json({ ok: true, agents: rows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
