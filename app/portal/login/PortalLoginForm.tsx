"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PortalLoginFormProps = {
  nextPath: string;
  initialError?: string;
};

export default function PortalLoginForm({ nextPath, initialError }: PortalLoginFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false,
        },
      });

      if (signInError) throw signInError;

      setMessage("Check your email for your secure sign-in link.");
    } catch {
      setError("Sign-in failed. Use an invited email or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-[var(--r)] border p-6 bg-[var(--panel)] border-[var(--line)]">
      <div>
        <h1 className="pg-title">Client Portal Login</h1>
        <p className="pg-sub">Invite-only access for your own lead data.</p>
        <p className="text-xs" style={{ color: "var(--tx-3)", marginTop: 8 }}>
          Use the same email address that was invited to the portal.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="sec-lbl">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{
            background: "var(--panel-2)",
            borderColor: "var(--line)",
            color: "var(--tx)",
          }}
          placeholder="you@company.com"
        />
      </div>

      <button className="btn btn-accent w-full" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send secure login link"}
      </button>

      {message ? (
        <p className="text-xs" style={{ color: "var(--grn)" }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs" style={{ color: "#f43f5e" }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
