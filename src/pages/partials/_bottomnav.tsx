import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import routes from "../../constants/routes";
import Icon from "../../component/icon/icons";
import Modal from "../../component/modal/modal";

const navItems = [
  { label: "Home", path: routes.dashboard, icon: "dashboard" },
  { label: "Budget", path: routes.budget, icon: "budget" },
  { label: "Goals", path: routes.goals, icon: "goal" },
  { label: "Txns", path: routes.transactions, icon: "transaction" },
];

const moreItems = [
  { label: "Net Worth", path: routes.netWorth, icon: "netWorth" },
  { label: "Monthly Reviews", path: routes.monthlyReviews, icon: "calendar" },
  { label: "Settings", path: routes.settings, icon: "settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg md:hidden dark:border-slate-700 dark:bg-slate-900">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${isActive ? "bg-teal-700 text-white" : "text-slate-500 dark:text-slate-400"}`}>
            <Icon name={item.icon} iconClass="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${isMoreActive ? "bg-teal-700 text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
          <Icon name="menu" iconClass="h-4 w-4" />
          More
        </button>
      </nav>

      <Modal isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <div className="space-y-1">
          {moreItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
            >
              <Icon name={item.icon} iconClass="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </Modal>
    </>
  );
}
