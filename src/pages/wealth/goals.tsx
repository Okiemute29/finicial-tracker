import { useState } from "react";
import StatusBadge from "../../component/badge/statusbadge";
import Button from "../../component/buttons/button";
import Icon from "../../component/icon/icons";
import Text from "../../component/typography/typography";
import GoalFormModal from "../../component/wealth/goals/GoalFormModal";
import type { GoalFormValues } from "../../component/wealth/goals/GoalFormModal";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { calculateGoalProgress } from "../../helpers/wealthCalculations";
import { useGoals } from "../../hooks/wealth/useGoals";
import type { Goal } from "../../models/wealth/types";

export default function GoalsPage() {
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

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
          <Text size="2xl" className="font-bold text-slate-950">Goal Tracker</Text>
          <Text size="sm" className="text-slate-500">Track rent, emergency, wedding, investments, business, and custom goals.</Text>
        </div>
        <Button size="sm" leftIcon="plus" onClick={openCreateModal} type="button">New goal</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal);
          return (
            <article key={goal.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <Text size="lg" className="font-semibold text-slate-950">{goal.name}</Text>
                <div className="flex items-center gap-2">
                  <StatusBadge label={goal.status} />
                  <button type="button" onClick={() => openEditModal(goal)} className="text-slate-400 transition hover:text-teal-700" aria-label={`Edit ${goal.name}`}>
                    <Icon name="edit" iconClass="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(goal)} className="text-slate-400 transition hover:text-red-600" aria-label={`Delete ${goal.name}`}>
                    <Icon name="trash" iconClass="h-4 w-4" />
                  </button>
                </div>
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

      <GoalFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialValue={editingGoal} submitting={submitting} />
    </div>
  );
}
