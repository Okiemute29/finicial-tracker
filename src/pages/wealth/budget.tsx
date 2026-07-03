import StatusBadge from "../../component/badge/statusbadge";
import DataTable from "../../component/table/data.table";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { budgetPercentageTotal, calculateBudgetAmount, isBudgetBalanced } from "../../helpers/wealthCalculations";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

export default function BudgetPage() {
  const { budgetCategories, monthlyIncome, activeExchangeRate, settings } = useWealthSnapshot();
  const localIncome = monthlyIncome * activeExchangeRate;
  const total = budgetPercentageTotal(budgetCategories);
  const balanced = isBudgetBalanced(budgetCategories);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text size="2xl" className="font-bold text-slate-950">Budget Planner</Text>
          <Text size="sm" className="text-slate-500">Percentages must total exactly 100%.</Text>
        </div>
        <StatusBadge label={balanced ? "Balanced" : `${total}% allocated`} variant={balanced ? "balanced" : "warning"} />
      </div>

      <DataTable
        columns={[{ header: "Category" }, { header: "Percentage" }, { header: "Monthly Amount" }, { header: "Color" }]}
        data={budgetCategories}
        renderRow={(category) => (
          <>
            <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium text-slate-900">{category.name}</td>
            <td className="border-y border-slate-200 px-4 py-4">{category.percentage}%</td>
            <td className="border-y border-slate-200 px-4 py-4">{formatCurrency(calculateBudgetAmount(localIncome, category.percentage), settings.spendingCurrency)}</td>
            <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4"><span className="block h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} /></td>
          </>
        )}
      />
    </div>
  );
}
