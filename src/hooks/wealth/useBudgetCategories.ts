import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import type { BudgetCategory } from "../../models/wealth/types";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useBudgetCategories() {
  const budgetCategories = useWealthStore((state) => state.budgetCategories);
  const setBudgetCategories = useWealthStore((state) => state.setBudgetCategories);

  async function saveBudgetCategories(next: BudgetCategory[]): Promise<boolean> {
    try {
      await wealthService.syncBudgetCategories(budgetCategories, next);
      setBudgetCategories(next);
      Success("Budget allocation saved.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save budget categories.");
      return false;
    }
  }

  return { budgetCategories, saveBudgetCategories };
}
