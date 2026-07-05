import { Outlet } from "react-router-dom";
import Button from "../../component/buttons/button";
import Skeleton from "../../component/skeletons/skeleton";
import Text from "../../component/typography/typography";
import { useLiveExchangeRate } from "../../hooks/wealth/useLiveExchangeRate";
import { useOverspendingAlert } from "../../hooks/wealth/useOverspendingAlert";
import { useWealthBootstrap } from "../../hooks/wealth/useWealthBootstrap";
import { useWealthStore } from "../../stores/wealthStore";
import { BottomNav, Header, Sidebar } from "../partials";

export default function RootLayout() {
  useWealthBootstrap();
  useLiveExchangeRate();
  useOverspendingAlert();
  const status = useWealthStore((state) => state.status);
  const error = useWealthStore((state) => state.error);
  const loadWealthData = useWealthStore((state) => state.loadWealthData);

  if (status === "idle" || status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-center shadow-sm">
          <Text size="lg" className="font-semibold text-slate-950">Couldn&apos;t load your data</Text>
          <Text size="sm" className="text-slate-500">{error}</Text>
          <Button onClick={() => loadWealthData()} type="button">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-4 bg-slate-100 p-3 md:p-4">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-24 md:pb-0">
        <Header />
        <main className="min-h-[calc(100vh-8rem)] rounded-2xl border border-slate-200 bg-white/70 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
