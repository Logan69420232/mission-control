"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={72} />
          <h1 className="text-2xl font-bold text-[#222222] tracking-tight mt-4">Mission Control</h1>
          <p className="text-sm text-[#888888] mt-1">Natural Foundation Supplements</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D6E4C0] rounded-2xl p-8 space-y-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
        >
          {error && (
            <div className="bg-[#FEE2E2] border border-red-200 rounded-xl p-3">
              <p className="text-sm text-[#991B1B]">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs text-[#888888] uppercase tracking-wider mb-1.5 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-[#DDDDDD] rounded-[10px] text-sm text-[#222222] placeholder-[#BBBBBB] focus:outline-none focus:border-[#82aa4b] focus:ring-1 focus:ring-[#82aa4b]/30 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-[#888888] uppercase tracking-wider mb-1.5 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-[#DDDDDD] rounded-[10px] text-sm text-[#222222] placeholder-[#BBBBBB] focus:outline-none focus:border-[#82aa4b] focus:ring-1 focus:ring-[#82aa4b]/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-semibold bg-[#82aa4b] hover:bg-[#6a8f3a] text-white rounded-[10px] shadow-[0_2px_6px_rgba(130,170,75,0.3)] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
