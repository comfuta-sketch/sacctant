import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
};

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    user: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async (userId: string | undefined) => {
      if (!userId) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    };

    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (!mounted) return;
      const isAdmin = await checkAdmin(session?.user?.id);
      if (!mounted) return;
      setState({
        loading: false,
        session,
        user: session?.user ?? null,
        isAdmin,
      });
    });

    // Then load existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const isAdmin = await checkAdmin(session?.user?.id);
      if (!mounted) return;
      setState({
        loading: false,
        session,
        user: session?.user ?? null,
        isAdmin,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
}
