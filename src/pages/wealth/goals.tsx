import StatusBadge from "../../component/badge/statusbadge";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { calculateGoalProgress } from "../../helpers/wealthCalculations";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

export default function GoalsPage() {
  const { goals } = useWealthSnapshot();
  return (
    <div className="space-y-5">
      <div>
        <Text size="2xl" className="font-bold text-slate-950">Goal Tracker</Text>
        <Text size="sm" className="text-slate-500">Track rent, emergency, wedding, investments, business, and custom goals.</Text>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal);
          return (
            <article key={goal.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <Text size="lg" className="font-semibold text-slate-950">{goal.name}</Text>
                <StatusBadge label={goal.status} />
              </div>
              <Text size="sm" className="mt-2 text-slate-500">{formatCurrency(goal.currentAmount, goal.currency)} saved of {formatCurrency(goal.targetAmount, goal.currency)}</Text>
              <div className="mt-5 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
              </div>
              <Text size="xs" className="mt-2 text-slate-500">{progress}% complete</Text>
            </article>
          );
        })}
      </div>
    </div>
  );
}
