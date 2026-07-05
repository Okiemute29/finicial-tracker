import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Icon from "../../component/icon/icons";
import MetricCard from "../../component/wealth/dashboard/MetricCard";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import {
  calculateBudgetAmount,
  calculateFinancialHealthScore,
  calculateGoalProgress,
  calculateInvestmentRate,
  calculateNetWorthTrend,
  calculateOverspend,
  calculateSavingsRate,
  generateCoachMessage,
  getUpcomingGoalEvents,
  resolveGoalTargetAmount,
  summarizeMonthlyTransactions,
} from "../../helpers/wealthCalculations";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const { monthlyIncome, activeExchangeRate, settings, budgetCategories, goals, netWorth, transactions, netWorthSnapshots } = useWealthSnapshot();
  const localIncome = monthlyIncome * activeExchangeRate;
  const budgetData = budgetCategories.map((category) => ({
    name: category.name,
    value: calculateBudgetAmount(localIncome, category.percentage),
    color: category.color,
  }));
  const topGoals = goals.slice(0, 3);
  const monthlySummary = summarizeMonthlyTransactions(transactions, currentMonth());
  const overspend = calculateOverspend(monthlySummary.expenses, localIncome);

  const savingsRate = calculateSavingsRate(goals);
  const investmentRate = calculateInvestmentRate(goals);
  const emergencyGoal = goals.find((goal) => goal.category === "emergency");
  const emergencyProgress = emergencyGoal
    ? calculateGoalProgress({ currentAmount: emergencyGoal.currentAmount, targetAmount: resolveGoalTargetAmount(emergencyGoal, settings) })
    : 0;
  const netWorthTrend = calculateNetWorthTrend(netWorthSnapshots);
  const healthScore = calculateFinancialHealthScore({
    emergencyProgress,
    savingsRate,
    totalAssets: netWorth.totalAssets,
    totalLiabilities: netWorth.totalLiabilities,
    netWorthTrend,
  });
  const upcomingEvents = getUpcomingGoalEvents(goals).slice(0, 3);
  const coachMessage = generateCoachMessage({ fullName: settings.fullName, goals, monthlyIncomeLocal: localIncome, settings });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900 dark:bg-teal-950/40">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-700 text-white">
            <Icon name="chart" iconClass="h-5 w-5" />
          </div>
          <Text size="sm" className="text-teal-900 dark:text-teal-300">{coachMessage}</Text>
        </div>
      </section>

      {overspend > 0 ? (
        <Text size="sm" className="rounded-lg bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
          You&apos;ve spent {formatCurrency(overspend, settings.spendingCurrency)} more than planned this month.
        </Text>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent label="Monthly Income" value={formatCurrency(monthlyIncome, settings.earningCurrency)} change="All income sources combined" icon="money" />
        <MetricCard label="Local Budget Base" value={formatCurrency(localIncome, settings.spendingCurrency)} change="Converted with active exchange rate" icon="budget" />
        <MetricCard label="Net Worth" value={formatCurrency(netWorth.netWorth, settings.earningCurrency)} change="Assets minus liabilities" icon="netWorth" />
        <MetricCard label="Active Goals" value={String(goals.filter((goal) => goal.status === "active").length)} change="Rent, emergency, wedding, investments, business" icon="goal" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Savings Rate" value={`${savingsRate}%`} change="Rent + Emergency + Wedding + Investments + Business" icon="trend" />
        <MetricCard label="Investment Rate" value={`${investmentRate}%`} change="Share of income going to investments" icon="chart" />
        <MetricCard
          label="Monthly Cash Flow"
          value={formatCurrency(monthlySummary.income - monthlySummary.expenses, settings.spendingCurrency)}
          change="Income minus expenses this month"
          icon="money"
        />
        <MetricCard
          label="Financial Health Score"
          value={`${healthScore}/100`}
          change="Emergency fund, savings rate, debt, net worth trend"
          icon="check"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 xl:col-span-3">
          <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Budget Allocation</Text>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">
          <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Goal Progress</Text>
          <div className="mt-5 space-y-4">
            {topGoals.map((goal) => {
              if (goal.targetType === "ongoing") {
                return (
                  <div key={goal.id}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <Text size="sm" className="font-medium text-slate-700 dark:text-slate-300">{goal.name}</Text>
                      <Text size="xs" className="text-slate-500 dark:text-slate-400">{formatCurrency(goal.currentAmount, goal.currency)}</Text>
                    </div>
                    <Text size="xs" className="text-slate-500 dark:text-slate-400">Ongoing · +{goal.contributionPercentage}% of income/month</Text>
                  </div>
                );
              }

              const resolvedTarget = resolveGoalTargetAmount(goal, settings);
              const progress = calculateGoalProgress({ currentAmount: goal.currentAmount, targetAmount: resolvedTarget });
              return (
                <div key={goal.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Text size="sm" className="font-medium text-slate-700 dark:text-slate-300">{goal.name}</Text>
                    <Text size="xs" className="text-slate-500 dark:text-slate-400">{progress}%</Text>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Upcoming Events</Text>
        {upcomingEvents.length === 0 ? (
          <Text size="sm" className="mt-3 text-slate-500 dark:text-slate-400">No goal due dates in the next 12 months.</Text>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {upcomingEvents.map((goal) => (
              <div key={goal.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <Text size="sm" className="font-semibold text-slate-900 dark:text-white">{goal.name}</Text>
                <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-400">Due {formatDueDate(goal.dueDate as string)}</Text>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
