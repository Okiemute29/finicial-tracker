import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import MetricCard from "../../component/wealth/dashboard/MetricCard";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { calculateBudgetAmount, calculateGoalProgress } from "../../helpers/wealthCalculations";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

export default function DashboardPage() {
  const { monthlyIncome, activeExchangeRate, settings, budgetCategories, goals, netWorth } = useWealthSnapshot();
  const localIncome = monthlyIncome * activeExchangeRate;
  const budgetData = budgetCategories.map((category) => ({
    name: category.name,
    value: calculateBudgetAmount(localIncome, category.percentage),
    color: category.color,
  }));
  const topGoals = goals.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent label="Monthly Income" value={formatCurrency(monthlyIncome, settings.earningCurrency)} change="All income sources combined" icon="money" />
        <MetricCard label="Local Budget Base" value={formatCurrency(localIncome, settings.spendingCurrency)} change="Converted with active exchange rate" icon="budget" />
        <MetricCard label="Net Worth" value={formatCurrency(netWorth.netWorth, settings.earningCurrency)} change="Assets minus liabilities" icon="netWorth" />
        <MetricCard label="Active Goals" value={String(goals.filter((goal) => goal.status === "active").length)} change="Rent, emergency, wedding, investments, business" icon="goal" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-3">
          <Text size="lg" className="font-semibold text-slate-950">Budget Allocation</Text>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={3}>
                  {budgetData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value), settings.spendingCurrency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <Text size="lg" className="font-semibold text-slate-950">Goal Progress</Text>
          <div className="mt-5 space-y-4">
            {topGoals.map((goal) => {
              const progress = calculateGoalProgress(goal);
              return (
                <div key={goal.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Text size="sm" className="font-medium text-slate-700">{goal.name}</Text>
                    <Text size="xs" className="text-slate-500">{progress}%</Text>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
