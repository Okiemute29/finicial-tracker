import Icon from "../icon/icons";

type Tab = { id: string; label: string; icon?: string };

export default function TabNavigation({ tabs, activeTab, onTabChange }: { tabs: Tab[]; activeTab: string; onTabChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-teal-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
            {tab.icon ? <Icon name={tab.icon} iconClass="h-4 w-4" /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
