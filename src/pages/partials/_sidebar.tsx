import { NavLink } from "react-router-dom";
import routes from "../../constants/routes";
import Icon from "../../component/icon/icons";
import Text from "../../component/typography/typography";

const navItems = [
  { label: "Dashboard", path: routes.dashboard, icon: "dashboard" },
  { label: "Budget", path: routes.budget, icon: "budget" },
  { label: "Goals", path: routes.goals, icon: "goal" },
  { label: "Transactions", path: routes.transactions, icon: "transaction" },
  { label: "Net Worth", path: routes.netWorth, icon: "netWorth" },
  { label: "Reviews", path: routes.monthlyReviews, icon: "calendar" },
  { label: "Settings", path: routes.settings, icon: "settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 md:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-700 text-white">
          <Icon name="money" iconClass="h-6 w-6" />
        </div>
        <div>
          <Text size="lg" className="font-bold text-slate-950">Robert Wealth</Text>
          <Text size="xs" className="text-slate-500">Percentage finance system</Text>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
          >
            <Icon name={item.icon} iconClass="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
