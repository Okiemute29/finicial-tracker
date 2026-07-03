import { assets, budgetCategories, financialSettings, goals, liabilities, monthlyReviews, transactions } from "../../mocks/wealth.mock";
import { supabase } from "../supabase/client";

export const wealthService = {
  async getDashboardSnapshot() {
    if (!supabase) {
      return { financialSettings, budgetCategories, goals, transactions, assets, liabilities, monthlyReviews };
    }

    return { financialSettings, budgetCategories, goals, transactions, assets, liabilities, monthlyReviews };
  },
};
