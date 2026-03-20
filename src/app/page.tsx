"use client";

import { useEffect, useState, useCallback } from "react";

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
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    idle: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    "running task": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    pending: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    running: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    done: "bg-green-500/20 text-green-400 border-green-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.idle}`}>
      {status}
    </span>
  );
}

function formatTokens(n: number): string {
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
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/cron").then((r) => r.json()),
      fetch("/api/usage/weekly").then((r) => r.json()),
    ]);
    setAgents(a);
    setTasks(t);
    setCrons(c);
    setUsage(u);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-sm text-slate-400 mt-1">AI Agent Management Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchAll}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Weekly Cost Summary */}
      {usage && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Tokens (Week)</p>
            <p className="text-2xl font-bold text-white mt-1">{formatTokens(usage.totals.total_tokens)}</p>
            <p className="text-xs text-slate-500 mt-1">${(usage.totals.total_cost_cents / 100).toFixed(2)} estimated</p>
          </div>
          {usage.perAgent.map((a) => (
            <div key={a.name} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider">{a.emoji} {a.name}</p>
              <p className="text-2xl font-bold text-white mt-1">{formatTokens(a.total_tokens)}</p>
              <p className="text-xs text-slate-500 mt-1">{a.model} &middot; ${(a.total_cost_cents / 100).toFixed(2)}</p>
            </div>
          ))}
          {usage.perModel.length > 1 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Per Model</p>
              {usage.perModel.map((m) => (
                <div key={m.model} className="mt-1">
                  <span className="text-sm text-white font-medium">{formatTokens(m.total_tokens)}</span>
                  <span className="text-xs text-slate-400 ml-2">{m.model}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents Panel */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Agents</h2>
          <div className="space-y-3">
            {agents.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
                <p className="text-slate-400">No agents connected yet</p>
              </div>
            ) : agents.map((agent) => (
              <div key={agent.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{agent.emoji}</span>
                    <div>
                      <h3 className="text-white font-semibold">{agent.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{agent.model}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
                {agent.current_task && (
                  <div className="mt-3 bg-slate-900/50 rounded-md p-2.5">
                    <p className="text-sm text-slate-300">{agent.current_task}</p>
                    <p className="text-xs text-slate-500 mt-1">Assigned by {agent.current_task_assigned_by}</p>
                  </div>
                )}
                <div className="mt-3 flex gap-4 text-xs text-slate-400">
                  <span>Session: <span className="text-slate-300 font-medium">{formatTokens(agent.session_tokens_used)}</span> tokens</span>
                  <span>Week: <span className="text-slate-300 font-medium">{formatTokens(agent.week_tokens_used)}</span> tokens</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tasks Feed */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Tasks Feed</h2>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
                <p className="text-slate-400">No tasks yet</p>
              </div>
            ) : tasks.map((task) => (
              <div key={task.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm text-white font-medium truncate">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{task.agent_emoji} {task.agent_name}</span>
                  <span>by {task.assigned_by}</span>
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
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recurring Tasks</h2>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Job</th>
                <th className="text-left p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Schedule</th>
                <th className="text-left p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Agent</th>
                <th className="text-left p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Last Run</th>
                <th className="text-left p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Next Run</th>
                <th className="text-left p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                <th className="text-right p-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody>
              {crons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No cron jobs</td>
                </tr>
              ) : crons.map((cron) => (
                <tr key={cron.id} className="border-b border-slate-700/30 last:border-0">
                  <td className="p-3 text-white font-medium">{cron.name}</td>
                  <td className="p-3 text-slate-300">{cron.schedule_human}</td>
                  <td className="p-3 text-slate-300">{cron.agent_emoji} {cron.agent_name}</td>
                  <td className="p-3 text-slate-400">{formatTime(cron.last_run)}</td>
                  <td className="p-3 text-slate-400">{formatTime(cron.next_run)}</td>
                  <td className="p-3"><StatusBadge status={cron.last_run_status} /></td>
                  <td className="p-3 text-right text-slate-300">{formatTokens(cron.last_run_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
