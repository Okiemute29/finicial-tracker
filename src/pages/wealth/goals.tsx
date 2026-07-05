import { useState } from "react";
import StatusBadge from "../../component/badge/statusbadge";
import Button from "../../component/buttons/button";
import Icon from "../../component/icon/icons";
import Text from "../../component/typography/typography";
import GoalFormModal from "../../component/wealth/goals/GoalFormModal";
import type { GoalFormValues } from "../../component/wealth/goals/GoalFormModal";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { calculateBudgetAmount, calculateGoalProgress, calculateProjectedCompletion, resolveGoalTargetAmount } from "../../helpers/wealthCalculations";
import { useGoals } from "../../hooks/wealth/useGoals";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import type { Goal } from "../../models/wealth/types";

function formatProjectedDate(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function GoalsPage() {
  const { settings, monthlyIncome, activeExchangeRate } = useWealthSnapshot();
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const localIncome = monthlyIncome * activeExchangeRate;

  function openCreateModal() {
    setEditingGoal(undefined);
    setModalOpen(true);
  }

  function openEditModal(goal: Goal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  async function handleSubmit(values: GoalFormValues) {
    setSubmitting(true);
    const success = editingGoal ? await updateGoal(editingGoal, values) : await createGoal(values);
    setSubmitting(false);
    if (success) setModalOpen(false);
  }

  async function handleDelete(goal: Goal) {
    if (!window.confirm(`Delete "${goal.name}"? This can't be undone.`)) return;
    await deleteGoal(goal);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text size="2xl" className="font-bold text-slate-950 dark:text-white">Goal Tracker</Text>
          <Text size="sm" className="text-slate-500 dark:text-slate-400">Every goal below is funded automatically as a share of your income — this is the plan working for you.</Text>
        </div>
        <Button size="sm" leftIcon="plus" onClick={openCreateModal} type="button">New goal</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const monthlyContribution = calculateBudgetAmount(localIncome, goal.contributionPercentage);
          const isOngoing = goal.targetType === "ongoing";
          const resolvedTarget = resolveGoalTargetAmount(goal, settings);
          const progress = isOngoing ? 0 : calculateGoalProgress({ currentAmount: goal.currentAmount, targetAmount: resolvedTarget });
          const projectedMonth = !isOngoing && goal.isAutoFunded ? calculateProjectedCompletion(goal.currentAmount, resolvedTarget, monthlyContribution) : null;

          return (
            <article key={goal.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Text size="lg" className="font-semibold text-slate-950 dark:text-white">{goal.name}</Text>
                  {goal.description ? <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-400">{goal.description}</Text> : null}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => openEditModal(goal)} className="text-slate-400 transition hover:text-teal-700 dark:text-slate-500 dark:hover:text-teal-400" aria-label={`Edit ${goal.name}`}>
                    <Icon name="edit" iconClass="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(goal)} className="text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400" aria-label={`Delete ${goal.name}`}>
                    <Icon name="trash" iconClass="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge label={goal.priority} />
                <StatusBadge label={goal.status} />
                {goal.isAutoFunded ? <StatusBadge label={`+${goal.contributionPercentage}% of income`} variant="income" /> : null}
              </div>

              {isOngoing ? (
                <div className="mt-4">
                  <Text size="xl" className="font-bold text-slate-950 dark:text-white">{formatCurrency(goal.currentAmount, goal.currency)}</Text>
                  <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-400">
                    Ongoing goal · {formatCurrency(monthlyContribution, goal.currency)}/month from income
                  </Text>
                </div>
              ) : (
                <>
                  <Text size="sm" className="mt-4 text-slate-500 dark:text-slate-400">{formatCurrency(goal.currentAmount, goal.currency)} saved of {formatCurrency(resolvedTarget, goal.currency)}</Text>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Text size="xs" className="text-slate-500 dark:text-slate-400">{progress}% complete</Text>
                    {projectedMonth ? <Text size="xs" className="text-slate-500 dark:text-slate-400">On pace for {formatProjectedDate(projectedMonth)}</Text> : null}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <GoalFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialValue={editingGoal} submitting={submitting} settings={settings} />
    </div>
  );
}
