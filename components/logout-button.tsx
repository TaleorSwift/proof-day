"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button onClick={logout} variant="ghost" size="sm" style={{ gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
      <LogOut size={16} />
      Cerrar sesión
    </Button>
  );
}
