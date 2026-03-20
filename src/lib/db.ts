import { sql } from "@vercel/postgres";

export { sql };

let initialized = false;

export async function initDb() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '🤖',
      model TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'idle',
      current_task TEXT,
      current_task_assigned_by TEXT,
      session_tokens_used INTEGER NOT NULL DEFAULT 0,
      week_tokens_used INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      agent_id INTEGER REFERENCES agents(id),
      assigned_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      token_cost INTEGER NOT NULL DEFAULT 0,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cron_jobs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      schedule_human TEXT NOT NULL,
      agent_id INTEGER REFERENCES agents(id),
      last_run TIMESTAMP,
      next_run TIMESTAMP,
      last_run_status TEXT,
      last_run_cost INTEGER DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS model_usage (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER REFERENCES agents(id),
      model TEXT NOT NULL,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      cost_cents INTEGER NOT NULL DEFAULT 0,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  initialized = true;
}
