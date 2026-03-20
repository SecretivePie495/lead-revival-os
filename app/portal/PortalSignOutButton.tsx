"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function PortalSignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.replace("/portal/login");
      return;
    }
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/portal/login");
  };

  return (
    <button className="btn" onClick={onSignOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
