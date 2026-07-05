import { create } from "zustand";
import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, MonthlyReview, NetWorthSnapshot, Transaction } from "../models/wealth/types";
import { wealthService } from "../services/wealth/wealth.service";

type WealthStatus = "idle" | "loading" | "loaded" | "error";

const emptySettings: FinancialSettings = {
  userId: "",
  fullName: null,
  earningCurrency: "USD",
  spendingCurrency: "USD",
  manualExchangeRateEnabled: false,
  manualExchangeRate: null,
  cachedExchangeRate: 1,
  monthlyLivingExpenses: 500000,
  emergencyFundMonths: 6,
  emailAlertsEnabled: true,
  theme: "system",
  incomeSources: [],
};

type WealthState = {
  status: WealthStatus;
  error: string | null;
  settings: FinancialSettings;
  budgetCategories: BudgetCategory[];
  goals: Goal[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  monthlyReviews: MonthlyReview[];
  netWorthSnapshots: NetWorthSnapshot[];
  setBudgetCategories: (categories: BudgetCategory[]) => void;
  setGoals: (items: Goal[]) => void;
  setTransactions: (items: Transaction[]) => void;
  setAssets: (items: Asset[]) => void;
  setLiabilities: (items: Liability[]) => void;
  setMonthlyReviews: (items: MonthlyReview[]) => void;
  setNetWorthSnapshots: (items: NetWorthSnapshot[]) => void;
  setSettings: (settings: FinancialSettings) => void;
  loadWealthData: () => Promise<void>;
  reset: () => void;
};

const initialData = {
  settings: emptySettings,
  budgetCategories: [] as BudgetCategory[],
  goals: [] as Goal[],
  transactions: [] as Transaction[],
  assets: [] as Asset[],
  liabilities: [] as Liability[],
  monthlyReviews: [] as MonthlyReview[],
  netWorthSnapshots: [] as NetWorthSnapshot[],
};

export const useWealthStore = create<WealthState>((set) => ({
  status: "idle",
  error: null,
  ...initialData,
  setBudgetCategories: (categories) => set({ budgetCategories: categories }),
  setGoals: (items) => set({ goals: items }),
  setTransactions: (items) => set({ transactions: items }),
  setAssets: (items) => set({ assets: items }),
  setLiabilities: (items) => set({ liabilities: items }),
  setMonthlyReviews: (items) => set({ monthlyReviews: items }),
  setNetWorthSnapshots: (items) => set({ netWorthSnapshots: items }),
  setSettings: (settings) => set({ settings }),
  loadWealthData: async () => {
    set({ status: "loading", error: null });
    try {
      const snapshot = await wealthService.getDashboardSnapshot();
      set({
        status: "loaded",
        settings: snapshot.financialSettings,
        budgetCategories: snapshot.budgetCategories,
        goals: snapshot.goals,
        transactions: snapshot.transactions,
        assets: snapshot.assets,
        liabilities: snapshot.liabilities,
        monthlyReviews: snapshot.monthlyReviews,
        netWorthSnapshots: snapshot.netWorthSnapshots,
      });
    } catch (error) {
      set({ status: "error", error: error instanceof Error ? error.message : "Failed to load wealth data." });
    }
  },
  reset: () => set({ status: "idle", error: null, ...initialData }),
}));
