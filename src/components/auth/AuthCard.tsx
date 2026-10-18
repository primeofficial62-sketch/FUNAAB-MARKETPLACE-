"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";

type University = { slug: string; short_name: string; name: string };

type Props = {
  accountType: "customer" | "vendor";
  initialMode: "login" | "signup";
  error?: string;
  universities: University[];
};

const input =
  "w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200";

export default function AuthCard({ accountType, initialMode, error, universities }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [universitySlug, setUniversitySlug] = useState(universities[0]?.slug ?? "funaab");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(
    error ? { ok: false, text: "Sign-in didn't complete. Please try again." } : null
  );

  const isVendor = accountType === "vendor";
  const next = isVendor ? "/auth?type=vendor" : "/";

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function signInWithGoogle() {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) {
      setMsg({ ok: false, text: error.message });
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
            university_slug: universitySlug,
          },
          emailRedirectTo: callbackUrl(),
        },
      });
      setBusy(false);
      if (error) return setMsg({ ok: false, text: error.message });
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      return setMsg({
        ok: true,
        text: "Check your email and tap the confirmation link to continue.",
      });
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    router.push(next);
    router.refresh();
  }

  const title = isVendor ? "Become a vendor" : "Start shopping";
  const sub = isVendor
    ? "Create a quick account first. You'll fill in your business details next."
    : "Create an account to save orders, track deliveries and check out.";

  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <span className="eyebrow">{isVendor ? "Vendors" : "Customers"}</span>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-950">{title}</h1>
      <p className="mt-2 text-sm text-emerald-900/70">{sub}</p>

      <div className="mt-6 grid grid-cols-2 rounded-full bg-emerald-50 p-1 text-sm font-semibold">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMsg(null);
            }}
            className={`rounded-full py-2 transition ${
              mode === m ? "bg-emerald-800 text-white shadow" : "text-emerald-800"
            }`}
          >
            {m === "signup" ? "Sign up" : "Log in"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-white py-3 font-semibold text-emerald-950 transition hover:bg-emerald-50 disabled:opacity-60"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-xs font-extrabold text-white">
          G
        </span>
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-emerald-900/50">
        <span className="h-px flex-1 bg-emerald-100" />
        or with email
        <span className="h-px flex-1 bg-emerald-100" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <input
            required
            value={fullName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className={input}
          />
        )}

        {mode === "signup" && !isVendor && (
          <select
            value={universitySlug}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setUniversitySlug(e.target.value)}
            className={input}
          >
            {universities.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.short_name}: {u.name}
              </option>
            ))}
          </select>
        )}

        <input
          required
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Email address"
          autoComplete="email"
          className={input}
        />
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={input}
        />

        {msg && (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
            }`}
          >
            {msg.text}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup"
            ? isVendor
              ? "Create account and continue"
              : "Create account"
            : "Log in"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-900/70">
        {isVendor ? (
          <>
            Want to shop instead?{" "}
            <Link href={ROUTES.startShopping} className="font-semibold text-emerald-800 underline">
              Start shopping
            </Link>
          </>
        ) : (
          <>
            Want to sell on campus?{" "}
            <Link href={ROUTES.becomeVendor} className="font-semibold text-emerald-800 underline">
              Become a vendor
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
