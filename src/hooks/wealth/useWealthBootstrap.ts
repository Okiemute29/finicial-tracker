import { useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useWealthStore } from "../../stores/wealthStore";

export function useWealthBootstrap() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const status = useWealthStore((state) => state.status);
  const loadWealthData = useWealthStore((state) => state.loadWealthData);
  const reset = useWealthStore((state) => state.reset);

  useEffect(() => {
    if (!userId) {
      reset();
      return;
    }
    if (status === "idle") {
      loadWealthData();
    }
  }, [userId, status, loadWealthData, reset]);
}
