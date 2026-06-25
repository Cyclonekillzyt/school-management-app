import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { usePasswordRecoveryStore } from "@/store/passwordRecoveryStore";

export function AuthListener() {
  const getSession = useAuthStore((s) => s.getSession);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(_event);
      if (!session?.user) {
        useAuthStore.setState({ user: null, authLoading: false });
        return;
      }

      if (_event === "PASSWORD_RECOVERY") {
        usePasswordRecoveryStore.setState({
          isVerified: true,
          step: "newPassword",
        });
        return;
      }

      getSession();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}
