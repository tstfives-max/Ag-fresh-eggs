"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminTopBar({ email }: { email: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
      <p className="text-sm text-foreground-muted">Signed in as {email ?? "admin"}</p>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-muted hover:bg-surface"
      >
        <LogOut size={15} /> Log out
      </button>
    </header>
  );
}
