import { sql, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await initDb();

  const { rows: perAgent } = await sql`
    SELECT a.name, a.emoji, a.model, SUM(u.tokens_used) as total_tokens, SUM(u.cost_cents) as total_cost_cents
    FROM model_usage u
    JOIN agents a ON u.agent_id = a.id
    WHERE u.date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY a.name, a.emoji, a.model
    ORDER BY total_tokens DESC
  `;

  const { rows: perModel } = await sql`
    SELECT model, SUM(tokens_used) as total_tokens, SUM(cost_cents) as total_cost_cents
    FROM model_usage
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY model
    ORDER BY total_tokens DESC
  `;

  const { rows: totalsRows } = await sql`
    SELECT SUM(tokens_used) as total_tokens, SUM(cost_cents) as total_cost_cents
    FROM model_usage
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  `;

  return NextResponse.json({ perAgent, perModel, totals: totalsRows[0] });
}
