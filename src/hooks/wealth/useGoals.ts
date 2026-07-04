import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import type { GoalFormValues } from "../../component/wealth/goals/GoalFormModal";
import type { Goal } from "../../models/wealth/types";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useGoals() {
  const goals = useWealthStore((state) => state.goals);
  const setGoals = useWealthStore((state) => state.setGoals);

  async function createGoal(values: GoalFormValues): Promise<boolean> {
    try {
      const created: Goal = { id: crypto.randomUUID(), ...values, dueDate: values.dueDate || undefined };
      await wealthService.createGoal(created);
      setGoals([...goals, created]);
      Success("Goal created.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to create goal.");
      return false;
    }
  }

  async function updateGoal(existing: Goal, values: GoalFormValues): Promise<boolean> {
    try {
      const updated: Goal = { ...existing, ...values, dueDate: values.dueDate || undefined };
      await wealthService.updateGoal(updated);
      setGoals(goals.map((goal) => (goal.id === updated.id ? updated : goal)));
      Success("Goal updated.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to update goal.");
      return false;
    }
  }

  async function deleteGoal(goal: Goal): Promise<boolean> {
    try {
      await wealthService.deleteGoal(goal.id);
      setGoals(goals.filter((item) => item.id !== goal.id));
      Success("Goal deleted.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to delete goal.");
      return false;
    }
  }

  return { goals, createGoal, updateGoal, deleteGoal };
}
