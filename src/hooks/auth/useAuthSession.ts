import { useEffect } from "react";
import { authService } from "../../services/auth/auth.service";
import { useAuthStore } from "../../stores/authStore";

export function useAuthSession() {
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let active = true;

    authService.getSession().then((session) => {
      if (!active) return;
      setSession(session);
      setInitialized(true);
    });

    const unsubscribe = authService.onAuthStateChange((session) => {
      setSession(session);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setSession, setInitialized]);
}
