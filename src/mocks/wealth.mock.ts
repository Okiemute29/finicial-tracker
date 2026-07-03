import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, MonthlyReview, Transaction } from "../models/wealth/types";

export const financialSettings: FinancialSettings = {
  userId: "demo-user",
  earningCurrency: "USD",
  spendingCurrency: "NGN",
  manualExchangeRateEnabled: false,
  manualExchangeRate: null,
  cachedExchangeRate: 1500,
  incomeSources: [
    { id: "income-1", label: "Primary salary", amount: 4500, currency: "USD", cadence: "monthly" },
    { id: "income-2", label: "Consulting", amount: 800, currency: "USD", cadence: "monthly" },
  ],
};

export const budgetCategories: BudgetCategory[] = [
  { id: "budget-1", name: "Rent", percentage: 30, color: "#2563eb", sortOrder: 1 },
  { id: "budget-2", name: "Savings", percentage: 20, color: "#0f766e", sortOrder: 2 },
  { id: "budget-3", name: "Family", percentage: 15, color: "#c2410c", sortOrder: 3 },
  { id: "budget-4", name: "Lifestyle", percentage: 15, color: "#7c3aed", sortOrder: 4 },
  { id: "budget-5", name: "Investments", percentage: 20, color: "#16a34a", sortOrder: 5 },
];

export const goals: Goal[] = [
  { id: "goal-1", name: "Rent", targetAmount: 3000, currentAmount: 2100, currency: "USD", status: "active" },
  { id: "goal-2", name: "Emergency", targetAmount: 10000, currentAmount: 4200, currency: "USD", status: "active" },
  { id: "goal-3", name: "Wedding", targetAmount: 15000, currentAmount: 5200, currency: "USD", status: "active" },
  { id: "goal-4", name: "Investments", targetAmount: 25000, currentAmount: 11200, currency: "USD", status: "active" },
  { id: "goal-5", name: "Business", targetAmount: 18000, currentAmount: 3500, currency: "USD", status: "paused" },
];

export const transactions: Transaction[] = [
  { id: "tx-1", type: "income", description: "Salary", amount: 4500, currency: "USD", convertedAmount: 6750000, date: "2026-07-01" },
  { id: "tx-2", type: "expense", categoryId: "budget-1", description: "Apartment payment", amount: 1200, currency: "USD", convertedAmount: 1800000, date: "2026-07-02" },
  { id: "tx-3", type: "expense", categoryId: "budget-4", description: "Groceries", amount: 180000, currency: "NGN", convertedAmount: 180000, date: "2026-07-03" },
];

export const assets: Asset[] = [
  { id: "asset-1", name: "Savings account", value: 8200, currency: "USD" },
  { id: "asset-2", name: "Investment portfolio", value: 12400, currency: "USD" },
];

export const liabilities: Liability[] = [
  { id: "liability-1", name: "Credit card", value: 950, currency: "USD" },
  { id: "liability-2", name: "Personal loan", value: 2100, currency: "USD" },
];

export const monthlyReviews: MonthlyReview[] = [
  { id: "review-1", month: "2026-07", plannedSpend: 3000000, actualSpend: 1980000, savings: 1020000, notes: "Spending is below plan so far. Keep category tracking consistent." },
];
