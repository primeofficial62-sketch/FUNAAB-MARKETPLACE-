import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthCard from "@/components/auth/AuthCard";
import VendorApplyForm from "@/components/auth/VendorApplyForm";

type SearchParams = Promise<{ type?: string; mode?: string; error?: string }>;

export default async function AuthPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const accountType = sp.type === "vendor" ? "vendor" : "customer";
  const initialMode = sp.mode === "login" ? "login" : "signup";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Customers who are already signed in don't need this page
  if (user && accountType === "customer") redirect("/");

  const { data: universities } = await supabase
    .from("universities")
    .select("id, slug, short_name, name")
    .eq("is_active", true)
    .order("short_name");

  let content;

  if (user && accountType === "vendor") {
    const [{ data: categories }, { data: application }] = await Promise.all([
      supabase.from("categories").select("slug, name").eq("is_active", true).order("sort_order"),
      supabase
        .from("vendor_applications")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    content = (
      <VendorApplyForm
        userId={user.id}
        email={user.email ?? ""}
        fullName={(user.user_metadata?.full_name as string) ?? ""}
        universities={universities ?? []}
        categories={categories ?? []}
        existingStatus={application?.status ?? null}
      />
    );
  } else {
    content = (
      <AuthCard
        accountType={accountType}
        initialMode={initialMode}
        error={sp.error}
        universities={universities ?? []}
      />
    );
  }

  return (
    <main className="bg-brand-soft flex min-h-screen items-center justify-center px-5 py-16">
      {content}
    </main>
  );
}
