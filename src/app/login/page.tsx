"use client";

import { Suspense, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const params                = useSearchParams();
  const nextPath              = params.get("next") ?? "/";
  const nav                   = useRouter();

  const supabase = getSupabaseBrowserClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${nextPath}` },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    const form = e.target as HTMLFormElement;
    const pw = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) { setError(error.message); return; }
    nav.push(nextPath);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#2C2F33" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8"
        style={{ background: "#36393F", border: "1px solid #444" }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#B0E0E6" }}>
          House of Power
        </h1>
        <p className="text-sm mb-6" style={{ color: "#9aa5b0" }}>
          Sign in to access your dashboard
        </p>

        {sent ? (
          <div className="text-center py-4" style={{ color: "#B0E0E6" }}>
            <p className="text-lg font-semibold mb-2">Check your email</p>
            <p className="text-sm" style={{ color: "#9aa5b0" }}>
              Magic link sent to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "#9aa5b0" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="christian@connectodin.com"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: "#23262A", border: "1px solid #444", color: "#B0E0E6" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !supabase}
                className="w-full rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "#B0E0E6", color: "#23262A" }}
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "#444" }} />
              <span className="text-xs" style={{ color: "#7a8a95" }}>or password</span>
              <div className="flex-1 h-px" style={{ background: "#444" }} />
            </div>

            <form onSubmit={handlePassword} className="space-y-4">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "#23262A", border: "1px solid #444", color: "#B0E0E6" }}
              />
              <button
                type="submit"
                disabled={loading || !supabase}
                className="w-full rounded-lg py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: "#36393F", border: "1px solid #B0E0E6", color: "#B0E0E6" }}
              >
                Sign in with password
              </button>
            </form>
          </>
        )}

        {error && (
          <p className="mt-3 text-xs text-center" style={{ color: "#ff6b6b" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
