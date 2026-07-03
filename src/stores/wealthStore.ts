import { create } from "zustand";
import { assets, budgetCategories, financialSettings, goals, liabilities, monthlyReviews, transactions } from "../mocks/wealth.mock";
import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, MonthlyReview, Transaction } from "../models/wealth/types";

type WealthState = {
  settings: FinancialSettings;
  budgetCategories: BudgetCategory[];
  goals: Goal[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  monthlyReviews: MonthlyReview[];
  setBudgetCategories: (categories: BudgetCategory[]) => void;
  setGoals: (items: Goal[]) => void;
  setTransactions: (items: Transaction[]) => void;
  setSettings: (settings: FinancialSettings) => void;
};

export const useWealthStore = create<WealthState>((set) => ({
  settings: financialSettings,
  budgetCategories,
  goals,
  transactions,
  assets,
  liabilities,
  monthlyReviews,
  setBudgetCategories: (categories) => set({ budgetCategories: categories }),
  setGoals: (items) => set({ goals: items }),
  setTransactions: (items) => set({ transactions: items }),
  setSettings: (settings) => set({ settings }),
}));
