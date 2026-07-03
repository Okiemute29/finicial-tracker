import { Outlet } from "react-router-dom";
import { BottomNav, Header, Sidebar } from "../partials";

export default function RootLayout() {
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
