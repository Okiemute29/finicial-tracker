import { useMemo, useState } from "react";
import StatusBadge from "../../component/badge/statusbadge";
import Button from "../../component/buttons/button";
import DataTable from "../../component/table/data.table";
import Text from "../../component/typography/typography";
import { Success } from "../../component/toastify/toastify";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { budgetPercentageTotal, calculateBudgetAmount, isBudgetBalanced } from "../../helpers/wealthCalculations";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import { useWealthStore } from "../../stores/wealthStore";
import type { BudgetCategory } from "../../models/wealth/types";

export default function BudgetPage() {
  const { budgetCategories, monthlyIncome, activeExchangeRate, settings } = useWealthSnapshot();
  const setBudgetCategories = useWealthStore((state) => state.setBudgetCategories);
  const [draft, setDraft] = useState<BudgetCategory[]>(budgetCategories);

  const localIncome = monthlyIncome * activeExchangeRate;
  const total = budgetPercentageTotal(draft);
  const balanced = isBudgetBalanced(draft);
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(budgetCategories), [draft, budgetCategories]);

  function handlePercentageChange(id: string, value: string) {
    const percentage = Number(value);
    setDraft((current) => current.map((category) => (category.id === id ? { ...category, percentage: Number.isFinite(percentage) ? percentage : 0 } : category)));
  }

  function handleSave() {
    setBudgetCategories(draft);
    Success("Budget allocation saved.");
  }

  function handleReset() {
    setDraft(budgetCategories);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text size="2xl" className="font-bold text-slate-950">Budget Planner</Text>
          <Text size="sm" className="text-slate-500">Percentages must total exactly 100%.</Text>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label={balanced ? "Balanced" : `${total}% allocated`} variant={balanced ? "balanced" : "warning"} />
          {isDirty ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleReset} type="button">Reset</Button>
              <Button size="sm" onClick={handleSave} disabled={!balanced} type="button">Save Changes</Button>
            </>
          ) : null}
        </div>
      </div>

      {!balanced ? (
        <Text size="sm" className="rounded-lg bg-amber-500/10 px-4 py-3 text-amber-700">
          Percentages must total 100% before you can save — currently at {total}%.
        </Text>
      ) : null}

      <DataTable
        columns={[{ header: "Category" }, { header: "Percentage" }, { header: "Monthly Amount" }, { header: "Color" }]}
        data={draft}
        renderRow={(category) => (
          <>
            <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium text-slate-900">{category.name}</td>
            <td className="border-y border-slate-200 px-4 py-4">
              <input
                type="number"
                min={0}
                max={100}
                value={category.percentage}
                onChange={(event) => handlePercentageChange(category.id, event.target.value)}
                className="h-10 w-20 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-teal-700"
              />
              <span className="ml-1 text-slate-500">%</span>
            </td>
            <td className="border-y border-slate-200 px-4 py-4">{formatCurrency(calculateBudgetAmount(localIncome, category.percentage), settings.spendingCurrency)}</td>
            <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4"><span className="block h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} /></td>
          </>
        )}
      />
    </div>
  );
}
