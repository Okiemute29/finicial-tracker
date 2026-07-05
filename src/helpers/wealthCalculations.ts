import { assetCategoryGroupLookup } from "../constants/netWorthCategories";
import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, Transaction } from "../models/wealth/types";

export function budgetPercentageTotal(categories: BudgetCategory[]) {
  return categories.reduce((total, category) => total + category.percentage, 0);
}

export function isBudgetBalanced(categories: BudgetCategory[]) {
  return Math.abs(budgetPercentageTotal(categories) - 100) < 0.001;
}

export function calculateBudgetAmount(income: number, percentage: number) {
  return Math.round((income * (percentage / 100) + Number.EPSILON) * 100) / 100;
}

export function calculateGoalProgress(goal: Pick<Goal, "currentAmount" | "targetAmount">) {
  if (!goal.targetAmount) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

export function calculateNetWorth(assets: Asset[], liabilities: Liability[]) {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

export function summarizeTransactions(transactions: Transaction[]) {
  const totals = transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") summary.income += transaction.convertedAmount;
      if (transaction.type === "expense") summary.expenses += transaction.convertedAmount;
      return summary;
    },
    { income: 0, expenses: 0 },
  );
  return { ...totals, savings: totals.income - totals.expenses };
}

export function summarizeMonthlyTransactions(transactions: Transaction[], month: string) {
  return summarizeTransactions(transactions.filter((transaction) => transaction.date.startsWith(month)));
}

export function calculateOverspend(actualSpend: number, plannedSpend: number) {
  return Math.max(0, actualSpend - plannedSpend);
}

export function resolveGoalTargetAmount(
  goal: Pick<Goal, "category" | "targetAmount">,
  settings: Pick<FinancialSettings, "monthlyLivingExpenses" | "emergencyFundMonths">,
) {
  if (goal.category === "emergency") {
    return settings.monthlyLivingExpenses * settings.emergencyFundMonths;
  }
  return goal.targetAmount;
}

export function calculateProjectedCompletion(currentAmount: number, targetAmount: number, monthlyContribution: number): string | null {
  if (monthlyContribution <= 0) return null;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return null;

  const monthsRemaining = Math.ceil(remaining / monthlyContribution);
  const projected = new Date();
  projected.setMonth(projected.getMonth() + monthsRemaining);
  return `${projected.getFullYear()}-${String(projected.getMonth() + 1).padStart(2, "0")}`;
}

export function groupAssetsByCategory(assets: Asset[]) {
  return {
    financial: assets.filter((asset) => assetCategoryGroupLookup[asset.category] === "Financial"),
    physical: assets.filter((asset) => assetCategoryGroupLookup[asset.category] === "Physical"),
    business: assets.filter((asset) => assetCategoryGroupLookup[asset.category] === "Business"),
    other: assets.filter((asset) => assetCategoryGroupLookup[asset.category] === "Other"),
  };
}
