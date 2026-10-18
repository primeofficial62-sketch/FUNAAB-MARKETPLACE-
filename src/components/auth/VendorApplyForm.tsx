"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  email: string;
  fullName: string;
  universities: { id: string; short_name: string; name: string }[];
  categories: { slug: string; name: string }[];
  existingStatus: string | null;
};

const input =
  "w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200";
const label = "mb-1.5 block text-xs font-semibold text-emerald-900";

type FormState = {
  ownerName: string;
  businessName: string;
  phone: string;
  universityId: string;
  description: string;
  verification: string;
};

export default function VendorApplyForm({
  userId,
  email,
  fullName,
  universities,
  categories,
  existingStatus,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    ownerName: fullName,
    businessName: "",
    phone: "",
    universityId: universities[0]?.id ?? "",
    description: "",
    verification: "",
  });

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggle = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  if (existingStatus || submitted) {
    const status = (existingStatus ?? "submitted").replace(/_/g, " ");
    return (
      <div className="card w-full max-w-md p-8 text-center">
        <Clock className="mx-auto h-10 w-10 text-emerald-800" />
        <h1 className="mt-4 text-2xl font-extrabold text-emerald-950">Application received</h1>
        <p className="mt-2 text-sm text-emerald-900/70">
          Current status: <span className="font-semibold capitalize">{status}</span>. We review
          every vendor before a store goes live, and we'll contact you at {email}.
        </p>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (picked.length === 0) return setError("Choose at least one category.");
    if (form.description.trim().length < 20)
      return setError("Describe your business in at least 20 characters.");

    setBusy(true);
    const { error } = await supabase.from("vendor_applications").insert({
      user_id: userId,
      university_id: form.universityId,
      owner_name: form.ownerName.trim(),
      business_name: form.businessName.trim(),
      email,
      phone: form.phone.trim(),
      business_description: form.description.trim(),
      category_slugs: picked,
      verification_notes: form.verification.trim() || null,
      status: "submitted",
    });
    setBusy(false);

    if (error) return setError(error.message);
    setSubmitted(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-lg space-y-5 p-6 sm:p-8">
      <div>
        <span className="eyebrow">Vendor application</span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-950">
          Tell us about your business
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70">
          Signed in as {email}. Stores go live only after approval.
        </p>
      </div>

      <div>
        <label className={label}>Owner's full name</label>
        <input required value={form.ownerName} onChange={set("ownerName")} className={input} />
      </div>

      <div>
        <label className={label}>Business or store name</label>
        <input required value={form.businessName} onChange={set("businessName")} className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Phone number</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="080..."
            className={input}
          />
        </div>
        <div>
          <label className={label}>University</label>
          <select value={form.universityId} onChange={set("universityId")} className={input}>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.short_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>What do you sell or offer?</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => {
            const on = picked.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  on
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={label}>Business description</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={set("description")}
          placeholder="What you offer, where on campus you operate, and how customers get their orders."
          className={input}
        />
      </div>

      <div>
        <label className={label}>Verification details (optional)</label>
        <textarea
          rows={2}
          value={form.verification}
          onChange={set("verification")}
          placeholder="Matric number, business registration, or anything that helps us verify you."
          className={input}
        />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit application
      </button>
    </form>
  );
}
