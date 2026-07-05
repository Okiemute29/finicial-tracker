import { assetCategoryGroupLookup } from "../constants/netWorthCategories";
import type { Asset, BudgetCategory, FinancialSettings, Goal, GoalCategory, Liability, NetWorthSnapshot, Transaction } from "../models/wealth/types";

const SAVINGS_GOAL_CATEGORIES: GoalCategory[] = ["rent", "emergency", "wedding", "investment", "business"];

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

export function calculateMonthsRemaining(currentAmount: number, targetAmount: number, monthlyContribution: number): number | null {
  if (monthlyContribution <= 0) return null;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return null;
  return Math.ceil(remaining / monthlyContribution);
}

export function calculateProjectedCompletion(currentAmount: number, targetAmount: number, monthlyContribution: number): string | null {
  const monthsRemaining = calculateMonthsRemaining(currentAmount, targetAmount, monthlyContribution);
  if (monthsRemaining === null) return null;

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

export function calculateSavingsRate(goals: Goal[]): number {
  return goals
    .filter((goal) => goal.isAutoFunded && SAVINGS_GOAL_CATEGORIES.includes(goal.category))
    .reduce((sum, goal) => sum + goal.contributionPercentage, 0);
}

export function calculateInvestmentRate(goals: Goal[]): number {
  const investmentGoal = goals.find((goal) => goal.category === "investment" && goal.isAutoFunded);
  return investmentGoal?.contributionPercentage ?? 0;
}

export function calculateNetWorthTrend(snapshots: NetWorthSnapshot[]): number | null {
  if (snapshots.length < 2) return null;
  const sorted = [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  if (first.netWorth === 0) return null;
  return Math.round(((latest.netWorth - first.netWorth) / Math.abs(first.netWorth)) * 100);
}

type FinancialHealthInput = {
  emergencyProgress: number;
  savingsRate: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorthTrend: number | null;
};

export function calculateFinancialHealthScore(input: FinancialHealthInput): number {
  const savingsScore = Math.min(100, Math.max(0, (input.savingsRate / 50) * 100));
  const debtRatio = input.totalAssets > 0 ? input.totalLiabilities / input.totalAssets : input.totalLiabilities > 0 ? 1 : 0;
  const debtScore = Math.max(0, 100 - debtRatio * 100);
  const trendScore = input.netWorthTrend === null ? 50 : Math.max(0, Math.min(100, 50 + input.netWorthTrend));

  const scores = [input.emergencyProgress, savingsScore, debtScore, trendScore];
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export function getUpcomingGoalEvents(goals: Goal[], withinDays = 365): Goal[] {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + withinDays);

  return goals
    .filter((goal): goal is Goal & { dueDate: string } => Boolean(goal.dueDate))
    .filter((goal) => {
      const due = new Date(goal.dueDate);
      return due >= now && due <= horizon;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function formatMonthLong(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

type CoachMessageInput = {
  fullName: string | null;
  goals: Goal[];
  monthlyIncomeLocal: number;
  settings: Pick<FinancialSettings, "monthlyLivingExpenses" | "emergencyFundMonths">;
};

export function generateCoachMessage(input: CoachMessageInput): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = input.fullName ? ` ${input.fullName}` : "";
  const savingsRate = calculateSavingsRate(input.goals);

  const sentences = [`${greeting}${name}. Your savings rate is ${Math.round(savingsRate)}%.`];

  const rentGoal = input.goals.find((goal) => goal.category === "rent" && goal.isAutoFunded);
  if (rentGoal) {
    const target = resolveGoalTargetAmount(rentGoal, input.settings);
    const monthlyContribution = calculateBudgetAmount(input.monthlyIncomeLocal, rentGoal.contributionPercentage);
    if (rentGoal.currentAmount >= target) {
      sentences.push(`Your ${rentGoal.name.toLowerCase()} goal is already fully funded.`);
    } else {
      const projected = calculateProjectedCompletion(rentGoal.currentAmount, target, monthlyContribution);
      if (projected) sentences.push(`You're on track to fund ${rentGoal.name.toLowerCase()} by ${formatMonthLong(projected)}.`);
    }
  }

  const weddingGoal = input.goals.find((goal) => goal.category === "wedding" && goal.isAutoFunded);
  if (weddingGoal && weddingGoal.currentAmount < weddingGoal.targetAmount) {
    const monthlyContribution = calculateBudgetAmount(input.monthlyIncomeLocal, weddingGoal.contributionPercentage);
    const monthsRemaining = calculateMonthsRemaining(weddingGoal.currentAmount, weddingGoal.targetAmount, monthlyContribution);
    if (monthsRemaining !== null) {
      const years = Math.round(monthsRemaining / 12);
      if (years >= 1) {
        sentences.push(`At your current pace, you'll reach your ${weddingGoal.name.toLowerCase()} in ${years} year${years === 1 ? "" : "s"}.`);
      } else {
        sentences.push(`At your current pace, you'll reach your ${weddingGoal.name.toLowerCase()} in about ${monthsRemaining} month${monthsRemaining === 1 ? "" : "s"}.`);
      }
    }
  }

  sentences.push("Keep going.");
  return sentences.join(" ");
}
