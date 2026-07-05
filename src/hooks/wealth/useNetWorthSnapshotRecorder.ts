import { useEffect, useRef } from "react";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";
import { useWealthSnapshot } from "./useWealthSnapshot";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useNetWorthSnapshotRecorder() {
  const status = useWealthStore((state) => state.status);
  const { netWorth } = useWealthSnapshot();
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (status !== "loaded" || hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    wealthService
      .upsertNetWorthSnapshot({ totalAssets: netWorth.totalAssets, totalLiabilities: netWorth.totalLiabilities, netWorth: netWorth.netWorth })
      .then(() => {
        const { netWorthSnapshots, setNetWorthSnapshots } = useWealthStore.getState();
        const todayStr = today();
        const withoutToday = netWorthSnapshots.filter((snapshot) => snapshot.capturedAt !== todayStr);
        setNetWorthSnapshots([
          ...withoutToday,
          { id: crypto.randomUUID(), capturedAt: todayStr, totalAssets: netWorth.totalAssets, totalLiabilities: netWorth.totalLiabilities, netWorth: netWorth.netWorth },
        ]);
      })
      .catch(() => {
        // Best-effort; the trend score just won't reflect today's snapshot until the next successful attempt.
      });
  }, [status, netWorth]);
}
