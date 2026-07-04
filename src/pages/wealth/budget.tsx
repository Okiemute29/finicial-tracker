import { useMemo, useState } from "react";
import StatusBadge from "../../component/badge/statusbadge";
import Button from "../../component/buttons/button";
import DataTable from "../../component/table/data.table";
import Icon from "../../component/icon/icons";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { budgetPercentageTotal, calculateBudgetAmount, isBudgetBalanced } from "../../helpers/wealthCalculations";
import { useBudgetCategories } from "../../hooks/wealth/useBudgetCategories";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import type { BudgetCategory } from "../../models/wealth/types";

const defaultColor = "#0f766e";

function createDraftCategory(sortOrder: number): BudgetCategory {
  return { id: crypto.randomUUID(), name: "New category", description: "", percentage: 0, color: defaultColor, sortOrder };
}

export default function BudgetPage() {
  const { monthlyIncome, activeExchangeRate, settings } = useWealthSnapshot();
  const { budgetCategories, saveBudgetCategories } = useBudgetCategories();
  const [draft, setDraft] = useState<BudgetCategory[]>(budgetCategories);
  const [saving, setSaving] = useState(false);

  const localIncome = monthlyIncome * activeExchangeRate;
  const total = budgetPercentageTotal(draft);
  const balanced = isBudgetBalanced(draft);
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(budgetCategories), [draft, budgetCategories]);

  function handleNameChange(id: string, value: string) {
    setDraft((current) => current.map((category) => (category.id === id ? { ...category, name: value } : category)));
  }

  function handleDescriptionChange(id: string, value: string) {
    setDraft((current) => current.map((category) => (category.id === id ? { ...category, description: value } : category)));
  }

  function handlePercentageChange(id: string, value: string) {
    const percentage = Number(value);
    setDraft((current) => current.map((category) => (category.id === id ? { ...category, percentage: Number.isFinite(percentage) ? percentage : 0 } : category)));
  }

  function handleColorChange(id: string, value: string) {
    setDraft((current) => current.map((category) => (category.id === id ? { ...category, color: value } : category)));
  }

  function handleAddCategory() {
    setDraft((current) => [...current, createDraftCategory(current.length + 1)]);
  }

  function handleDeleteCategory(id: string) {
    setDraft((current) => current.filter((category) => category.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    await saveBudgetCategories(draft);
    setSaving(false);
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
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={saving} type="button">Reset</Button>
              <Button size="sm" onClick={handleSave} disabled={!balanced} loading={saving} type="button">Save Changes</Button>
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
        columns={[{ header: "Category" }, { header: "Purpose" }, { header: "Percentage" }, { header: "Monthly Amount" }, { header: "Color" }, { header: "" }]}
        data={draft}
        renderRow={(category) => (
          <>
            <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium text-slate-900">
              <input
                type="text"
                value={category.name}
                onChange={(event) => handleNameChange(category.id, event.target.value)}
                className="h-10 w-full min-w-32 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-teal-700"
              />
            </td>
            <td className="border-y border-slate-200 px-4 py-4">
              <input
                type="text"
                value={category.description}
                onChange={(event) => handleDescriptionChange(category.id, event.target.value)}
                placeholder="What is this for?"
                className="h-10 w-full min-w-48 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-teal-700"
              />
            </td>
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
            <td className="border-y border-slate-200 px-4 py-4">
              <input
                type="color"
                value={category.color}
                onChange={(event) => handleColorChange(category.id, event.target.value)}
                className="h-9 w-9 cursor-pointer rounded-full border border-slate-200 p-0.5"
              />
            </td>
            <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4 text-right">
              <button type="button" onClick={() => handleDeleteCategory(category.id)} className="text-slate-400 transition hover:text-red-600" aria-label={`Delete ${category.name}`}>
                <Icon name="trash" iconClass="h-4 w-4" />
              </button>
            </td>
          </>
        )}
      />

      <Button variant="outline" size="sm" leftIcon="plus" onClick={handleAddCategory} type="button">Add category</Button>
    </div>
  );
}
