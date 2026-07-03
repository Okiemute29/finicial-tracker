import { NavLink } from "react-router-dom";
import routes from "../../constants/routes";
import Icon from "../../component/icon/icons";

const navItems = [
  { label: "Home", path: routes.dashboard, icon: "dashboard" },
  { label: "Budget", path: routes.budget, icon: "budget" },
  { label: "Goals", path: routes.goals, icon: "goal" },
  { label: "Txns", path: routes.transactions, icon: "transaction" },
  { label: "More", path: routes.settings, icon: "settings" },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg md:hidden">
      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${isActive ? "bg-teal-700 text-white" : "text-slate-500"}`}>
          <Icon name={item.icon} iconClass="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
