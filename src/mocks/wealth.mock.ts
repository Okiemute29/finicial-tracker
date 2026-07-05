import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, MonthlyReview, Transaction } from "../models/wealth/types";

export const financialSettings: FinancialSettings = {
  userId: "demo-user",
  fullName: "Robert",
  earningCurrency: "USD",
  spendingCurrency: "NGN",
  manualExchangeRateEnabled: false,
  manualExchangeRate: null,
  cachedExchangeRate: 1500,
  monthlyLivingExpenses: 500000,
  emergencyFundMonths: 6,
  emailAlertsEnabled: true,
  theme: "system",
  incomeSources: [
    { id: "income-1", label: "Primary salary", amount: 4500, currency: "USD", cadence: "monthly" },
    { id: "income-2", label: "Consulting", amount: 800, currency: "USD", cadence: "monthly" },
  ],
};

export const budgetCategories: BudgetCategory[] = [
  { id: "budget-1", name: "🏠 Rent Fund", description: "Save for next year's rent.", percentage: 12, color: "#2563eb", sortOrder: 1, linkedGoalId: "goal-1" },
  { id: "budget-2", name: "🚨 Emergency Fund", description: "Build until you have 6 months of expenses, then redirect this percentage to investing.", percentage: 12, color: "#dc2626", sortOrder: 2, linkedGoalId: "goal-2" },
  { id: "budget-3", name: "📈 Investments", description: "Long-term wealth (ETFs, index funds, etc.).", percentage: 20, color: "#16a34a", sortOrder: 3, linkedGoalId: "goal-4" },
  { id: "budget-4", name: "💍 Wedding Fund", description: "Save for your future wedding.", percentage: 8, color: "#db2777", sortOrder: 4, linkedGoalId: "goal-3" },
  { id: "budget-5", name: "🍜 Living Expenses", description: "Food, transport, utilities, family support, internet, etc.", percentage: 38, color: "#ea580c", sortOrder: 5 },
  { id: "budget-6", name: "🚀 Business & Self Development", description: "Courses, AI tools, your startup, agency, equipment.", percentage: 7, color: "#7c3aed", sortOrder: 6, linkedGoalId: "goal-5" },
  { id: "budget-7", name: "🎉 Lifestyle", description: "Entertainment, clothes, eating out, guilt-free spending.", percentage: 3, color: "#0f766e", sortOrder: 7 },
];

export const goals: Goal[] = [
  { id: "goal-1", name: "Annual Rent", description: "Always have next year's rent ready.", category: "rent", priority: "critical", contributionPercentage: 12, targetAmount: 1800000, currentAmount: 210000, currency: "NGN", status: "active", targetType: "fixed", isAutoFunded: true, dueDate: "2027-08-01" },
  { id: "goal-2", name: "Emergency Fund", description: "6 months of living expenses, ready for emergencies.", category: "emergency", priority: "critical", contributionPercentage: 12, targetAmount: 3000000, currentAmount: 420000, currency: "NGN", status: "active", targetType: "fixed", isAutoFunded: true },
  { id: "goal-3", name: "Wedding Fund", description: "Save for your future wedding.", category: "wedding", priority: "high", contributionPercentage: 8, targetAmount: 6000000, currentAmount: 520000, currency: "NGN", status: "active", targetType: "fixed", isAutoFunded: true },
  { id: "goal-4", name: "Investment Portfolio", description: "Ongoing long-term wealth building (ETFs, index funds, etc.).", category: "investment", priority: "high", contributionPercentage: 20, targetAmount: 0, currentAmount: 1120000, currency: "NGN", status: "active", targetType: "ongoing", isAutoFunded: true },
  { id: "goal-5", name: "Business Growth Fund", description: "Courses, AI tools, laptop, startup, agency, equipment.", category: "business", priority: "medium", contributionPercentage: 7, targetAmount: 0, currentAmount: 350000, currency: "NGN", status: "active", targetType: "ongoing", isAutoFunded: true },
];

export const transactions: Transaction[] = [
  { id: "tx-1", type: "income", category: "Salary", description: "Salary", amount: 4500, currency: "USD", convertedAmount: 6750000, date: "2026-07-01" },
  { id: "tx-2", type: "expense", categoryId: "budget-1", category: "Housing", description: "Apartment payment", amount: 1200, currency: "USD", convertedAmount: 1800000, date: "2026-07-02" },
  { id: "tx-3", type: "expense", categoryId: "budget-4", category: "Food", description: "Groceries", amount: 180000, currency: "NGN", convertedAmount: 180000, date: "2026-07-03" },
];

export const assets: Asset[] = [
  { id: "asset-1", name: "Savings account", value: 8200, currency: "USD", category: "savings" },
  { id: "asset-2", name: "Investment portfolio", value: 12400, currency: "USD", category: "investments" },
];

export const liabilities: Liability[] = [
  { id: "liability-1", name: "Credit card", value: 950, currency: "USD", category: "credit_card_debt" },
  { id: "liability-2", name: "Personal loan", value: 2100, currency: "USD", category: "personal_loan" },
];

export const monthlyReviews: MonthlyReview[] = [
  { id: "review-1", month: "2026-07", plannedSpend: 3000000, actualSpend: 1980000, savings: 1020000, savingsRate: 34, netWorthSnapshot: 19650, notes: "Spending is below plan so far. Keep category tracking consistent.", whatWentWell: "", whatCouldImprove: "", biggestWin: "", lessonsLearned: "", autoSummary: "" },
];
