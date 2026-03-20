"use client";

import { useEffect, useState, useCallback } from "react";
import Logo from "@/components/Logo";

interface Agent {
  id: number;
  name: string;
  emoji: string;
  model: string;
  status: string;
  current_task: string | null;
  current_task_assigned_by: string | null;
  session_tokens_used: number;
  week_tokens_used: number;
}

interface Task {
  id: number;
  name: string;
  description: string;
  agent_name: string;
  agent_emoji: string;
  assigned_by: string;
  status: string;
  token_cost: number;
  started_at: string | null;
  completed_at: string | null;
}

interface CronJob {
  id: number;
  name: string;
  schedule_human: string;
  agent_name: string;
  agent_emoji: string;
  last_run: string | null;
  next_run: string | null;
  last_run_status: string;
  last_run_cost: number;
}

interface WeeklyUsage {
  perAgent: { name: string; emoji: string; model: string; total_tokens: number; total_cost_cents: number }[];
  perModel: { model: string; total_tokens: number; total_cost_cents: number }[];
  totals: { total_tokens: number; total_cost_cents: number };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#D9E4B8] text-[#3a5a1a] border-[#C0D0A0]",
    idle: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
    "running task": "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    pending: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
    running: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    done: "bg-[#D9E4B8] text-[#3a5a1a] border-[#C0D0A0]",
    failed: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.idle}`}>
      {status}
    </span>
  );
}

function formatTokens(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatDuration(started: string | null, completed: string | null): string {
  if (!started) return "-";
  const start = new Date(started);
  const end = completed ? new Date(completed) : new Date();
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [usage, setUsage] = useState<WeeklyUsage | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    const [a, t, c, u] = await Promise.all([
      fetch("/api/agents").then((r) => r.json()).catch(() => []),
      fetch("/api/tasks").then((r) => r.json()).catch(() => []),
      fetch("/api/cron").then((r) => r.json()).catch(() => []),
      fetch("/api/usage/weekly").then((r) => r.json()).catch(() => ({})),
    ]);
    setAgents(Array.isArray(a) ? a : []);
    setTasks(Array.isArray(t) ? t : []);
    setCrons(Array.isArray(c) ? c : []);
    setUsage(u && u.perAgent ? u : null);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const activeCount = agents.filter((a) => a.status === "active" || a.status === "running task").length;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#82aa4b] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <h1 className="text-xl font-bold text-[#222222] tracking-tight">Mission Control</h1>
              <p className="text-xs text-[#888888]">NF Supplements</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#888888]">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchAll}
              className="px-4 py-1.5 text-xs font-medium bg-[#82aa4b] hover:bg-[#6a8f3a] text-white rounded-[10px] shadow-[0_2px_6px_rgba(130,170,75,0.3)] transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="px-4 py-1.5 text-xs font-medium text-[#666666] bg-white hover:bg-[#F5F5F5] rounded-full border border-[#D6E4C0] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Stats Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-xs text-[#888888] uppercase tracking-wider font-medium">Total Agents</p>
            <p className="text-3xl font-bold text-[#222222] mt-2">{agents.length}</p>
          </div>
          <div className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-xs text-[#888888] uppercase tracking-wider font-medium">Active Now</p>
            <p className="text-3xl font-bold text-[#82aa4b] mt-2">{activeCount}</p>
          </div>
          <div className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-xs text-[#888888] uppercase tracking-wider font-medium">Tokens This Week</p>
            <p className="text-3xl font-bold text-[#222222] mt-2">{formatTokens(usage?.totals?.total_tokens)}</p>
            <p className="text-xs text-[#888888] mt-1">${((usage?.totals?.total_cost_cents ?? 0) / 100).toFixed(2)} estimated</p>
          </div>
          <div className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-xs text-[#888888] uppercase tracking-wider font-medium">Cron Jobs</p>
            <p className="text-3xl font-bold text-[#222222] mt-2">{crons.length}</p>
          </div>
        </div>

        {/* Weekly Usage Breakdown */}
        {usage && (usage.perAgent.length > 0 || usage.perModel.length > 1) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {usage.perAgent.map((a) => (
              <div key={a.name} className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
                <p className="text-xs text-[#888888] uppercase tracking-wider font-medium">{a.emoji} {a.name}</p>
                <p className="text-2xl font-bold text-[#222222] mt-2">{formatTokens(a.total_tokens)}</p>
                <p className="text-xs text-[#888888] mt-1">{a.model} &middot; ${(a.total_cost_cents / 100).toFixed(2)}</p>
              </div>
            ))}
            {usage.perModel.length > 1 && (
              <div className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
                <p className="text-xs text-[#888888] uppercase tracking-wider font-medium">Per Model</p>
                {usage.perModel.map((m) => (
                  <div key={m.model} className="mt-2">
                    <span className="text-sm text-[#222222] font-semibold">{formatTokens(m.total_tokens)}</span>
                    <span className="text-xs text-[#888888] ml-2">{m.model}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agents Panel */}
          <section>
            <h2 className="text-lg font-bold text-[#222222] mb-4">Agents</h2>
            <div className="space-y-4">
              {agents.length === 0 ? (
                <div className="bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
                  <p className="text-[#888888]">No agents connected yet</p>
                </div>
              ) : agents.map((agent) => (
                <div key={agent.id} className="card-blob bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <h3 className="text-[#222222] font-semibold">{agent.name}</h3>
                        <p className="text-xs text-[#888888] font-mono">{agent.model}</p>
                      </div>
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>
                  {agent.current_task && (
                    <div className="mt-3 bg-[#F5F5F5] rounded-xl p-3">
                      <p className="text-sm text-[#555555]">{agent.current_task}</p>
                      <p className="text-xs text-[#888888] mt-1">Assigned by {agent.current_task_assigned_by ?? "unknown"}</p>
                    </div>
                  )}
                  <div className="mt-3 flex gap-4 text-xs text-[#888888]">
                    <span>Session: <span className="text-[#222222] font-medium">{formatTokens(agent.session_tokens_used)}</span> tokens</span>
                    <span>Week: <span className="text-[#222222] font-medium">{formatTokens(agent.week_tokens_used)}</span> tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tasks Feed */}
          <section>
            <h2 className="text-lg font-bold text-[#222222] mb-4">Tasks Feed</h2>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
                  <p className="text-[#888888]">No tasks yet</p>
                </div>
              ) : tasks.map((task) => (
                <div key={task.id} className="bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm text-[#222222] font-semibold truncate">{task.name}</h3>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="text-xs text-[#888888] mt-0.5 truncate">{task.description ?? ""}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#888888]">
                    <span>{task.agent_emoji ?? ""} {task.agent_name ?? ""}</span>
                    <span>by {task.assigned_by ?? "unknown"}</span>
                    <span>{formatTime(task.started_at)}</span>
                    <span>{formatDuration(task.started_at, task.completed_at)}</span>
                    <span>{formatTokens(task.token_cost)} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Cron Jobs */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-[#222222] mb-4">Recurring Tasks</h2>
          <div className="bg-white border border-[#D6E4C0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D6E4C0]">
                  <th className="text-left p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Job</th>
                  <th className="text-left p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Schedule</th>
                  <th className="text-left p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Agent</th>
                  <th className="text-left p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Last Run</th>
                  <th className="text-left p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Next Run</th>
                  <th className="text-left p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs text-[#888888] font-medium uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody>
                {crons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#888888]">No cron jobs</td>
                  </tr>
                ) : crons.map((cron) => (
                  <tr key={cron.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-4 text-[#222222] font-medium">{cron.name ?? ""}</td>
                    <td className="p-4 text-[#555555]">{cron.schedule_human ?? ""}</td>
                    <td className="p-4 text-[#555555]">{cron.agent_emoji ?? ""} {cron.agent_name ?? ""}</td>
                    <td className="p-4 text-[#888888]">{formatTime(cron.last_run)}</td>
                    <td className="p-4 text-[#888888]">{formatTime(cron.next_run)}</td>
                    <td className="p-4"><StatusBadge status={cron.last_run_status ?? "unknown"} /></td>
                    <td className="p-4 text-right text-[#555555]">{formatTokens(cron.last_run_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
