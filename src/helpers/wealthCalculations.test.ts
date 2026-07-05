import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Asset, BudgetCategory, Goal, Liability, NetWorthSnapshot, Transaction } from "../models/wealth/types";
import {
  budgetPercentageTotal,
  calculateBudgetAmount,
  calculateFinancialHealthScore,
  calculateGoalProgress,
  calculateInvestmentRate,
  calculateMonthsRemaining,
  calculateNetWorth,
  calculateNetWorthTrend,
  calculateOverspend,
  calculateProjectedCompletion,
  calculateReviewSavingsRate,
  calculateSavingsRate,
  generateCoachMessage,
  generateReviewSummary,
  getUpcomingGoalEvents,
  groupAssetsByCategory,
  isBudgetBalanced,
  resolveGoalTargetAmount,
  summarizeMonthlyTransactions,
  summarizeTransactions,
} from "./wealthCalculations";

function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return { id: "cat-1", name: "Rent", description: "", percentage: 30, color: "#000", sortOrder: 1, ...overrides };
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return { id: "tx-1", type: "expense", description: "Groceries", amount: 100, currency: "USD", convertedAmount: 100, date: "2026-07-01", ...overrides };
}

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    name: "Goal",
    description: "",
    category: "custom",
    priority: "medium",
    contributionPercentage: 0,
    targetAmount: 1000,
    currentAmount: 0,
    currency: "USD",
    status: "active",
    targetType: "fixed",
    isAutoFunded: false,
    ...overrides,
  };
}

function makeSnapshot(overrides: Partial<NetWorthSnapshot> = {}): NetWorthSnapshot {
  return { id: "snap-1", capturedAt: "2026-01-01", totalAssets: 1000, totalLiabilities: 200, netWorth: 800, ...overrides };
}

describe("budgetPercentageTotal", () => {
  it("sums percentages across categories", () => {
    expect(budgetPercentageTotal([makeCategory({ percentage: 30 }), makeCategory({ percentage: 20 })])).toBe(50);
  });

  it("returns 0 for an empty list", () => {
    expect(budgetPercentageTotal([])).toBe(0);
  });
});

describe("isBudgetBalanced", () => {
  it("is true when percentages sum to exactly 100", () => {
    expect(isBudgetBalanced([makeCategory({ percentage: 60 }), makeCategory({ percentage: 40 })])).toBe(true);
  });

  it("is true within floating-point tolerance", () => {
    const categories = [makeCategory({ percentage: 33.33 }), makeCategory({ percentage: 33.33 }), makeCategory({ percentage: 33.34 })];
    expect(isBudgetBalanced(categories)).toBe(true);
  });

  it("is false when percentages don't sum to 100", () => {
    expect(isBudgetBalanced([makeCategory({ percentage: 50 })])).toBe(false);
  });
});

describe("calculateBudgetAmount", () => {
  it("computes the percentage share of income", () => {
    expect(calculateBudgetAmount(1000, 30)).toBe(300);
  });

  it("rounds to 2 decimal places", () => {
    expect(calculateBudgetAmount(100, 33.333)).toBeCloseTo(33.33, 2);
  });

  it("returns 0 for 0% allocation", () => {
    expect(calculateBudgetAmount(1000, 0)).toBe(0);
  });
});

describe("calculateGoalProgress", () => {
  it("computes percent complete, rounded", () => {
    expect(calculateGoalProgress({ currentAmount: 2500, targetAmount: 10000 })).toBe(25);
  });

  it("caps progress at 100 even if overfunded", () => {
    expect(calculateGoalProgress({ currentAmount: 15000, targetAmount: 10000 })).toBe(100);
  });

  it("returns 0 when target amount is 0 to avoid dividing by zero", () => {
    expect(calculateGoalProgress({ currentAmount: 500, targetAmount: 0 })).toBe(0);
  });
});

describe("calculateNetWorth", () => {
  it("sums assets and liabilities and subtracts", () => {
    const assets: Asset[] = [
      { id: "a1", name: "Savings", value: 8000, currency: "USD", category: "savings" },
      { id: "a2", name: "Car", value: 5000, currency: "USD", category: "car" },
    ];
    const liabilities: Liability[] = [{ id: "l1", name: "Loan", value: 3000, currency: "USD", category: "personal_loan" }];
    expect(calculateNetWorth(assets, liabilities)).toEqual({ totalAssets: 13000, totalLiabilities: 3000, netWorth: 10000 });
  });

  it("handles no assets or liabilities", () => {
    expect(calculateNetWorth([], [])).toEqual({ totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
  });

  it("allows a negative net worth when liabilities exceed assets", () => {
    const assets: Asset[] = [{ id: "a1", name: "Cash", value: 1000, currency: "USD", category: "cash" }];
    const liabilities: Liability[] = [{ id: "l1", name: "Debt", value: 5000, currency: "USD", category: "other_debt" }];
    expect(calculateNetWorth(assets, liabilities).netWorth).toBe(-4000);
  });
});

describe("summarizeTransactions", () => {
  it("sums income and expenses separately using converted amounts", () => {
    const transactions = [
      makeTransaction({ type: "income", convertedAmount: 5000 }),
      makeTransaction({ type: "expense", convertedAmount: 1200 }),
      makeTransaction({ type: "expense", convertedAmount: 300 }),
    ];
    expect(summarizeTransactions(transactions)).toEqual({ income: 5000, expenses: 1500, savings: 3500 });
  });

  it("returns zeros for an empty list", () => {
    expect(summarizeTransactions([])).toEqual({ income: 0, expenses: 0, savings: 0 });
  });

  it("allows negative savings when expenses exceed income", () => {
    const transactions = [makeTransaction({ type: "income", convertedAmount: 1000 }), makeTransaction({ type: "expense", convertedAmount: 1500 })];
    expect(summarizeTransactions(transactions).savings).toBe(-500);
  });
});

describe("summarizeMonthlyTransactions", () => {
  it("only includes transactions within the given month", () => {
    const transactions = [
      makeTransaction({ type: "expense", convertedAmount: 100, date: "2026-07-01" }),
      makeTransaction({ type: "expense", convertedAmount: 200, date: "2026-07-15" }),
      makeTransaction({ type: "expense", convertedAmount: 999, date: "2026-08-01" }),
    ];
    expect(summarizeMonthlyTransactions(transactions, "2026-07").expenses).toBe(300);
  });

  it("returns zeros when no transactions match the month", () => {
    expect(summarizeMonthlyTransactions([makeTransaction({ date: "2026-01-01" })], "2026-07")).toEqual({ income: 0, expenses: 0, savings: 0 });
  });
});

describe("calculateOverspend", () => {
  it("returns the amount spent beyond the plan", () => {
    expect(calculateOverspend(1200, 1000)).toBe(200);
  });

  it("returns 0 when spending is within plan", () => {
    expect(calculateOverspend(800, 1000)).toBe(0);
  });

  it("returns 0 when spending exactly matches the plan", () => {
    expect(calculateOverspend(1000, 1000)).toBe(0);
  });
});

describe("resolveGoalTargetAmount", () => {
  const settings = { monthlyLivingExpenses: 500000, emergencyFundMonths: 6 };

  it("computes the emergency fund target from monthly living expenses × months", () => {
    expect(resolveGoalTargetAmount({ category: "emergency", targetAmount: 3000000 }, settings)).toBe(3000000);
  });

  it("reflects settings changes even if the stored target is stale", () => {
    expect(resolveGoalTargetAmount({ category: "emergency", targetAmount: 999 }, { monthlyLivingExpenses: 400000, emergencyFundMonths: 3 })).toBe(1200000);
  });

  it("returns the stored target amount for non-emergency goals", () => {
    expect(resolveGoalTargetAmount({ category: "rent", targetAmount: 1800000 }, settings)).toBe(1800000);
  });
});

describe("calculateProjectedCompletion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("projects a completion month from the remaining amount and monthly contribution", () => {
    expect(calculateProjectedCompletion(0, 1200, 400)).toBe("2026-04");
  });

  it("returns null when the goal is already met", () => {
    expect(calculateProjectedCompletion(1200, 1000, 400)).toBeNull();
  });

  it("returns null when there is no monthly contribution", () => {
    expect(calculateProjectedCompletion(0, 1000, 0)).toBeNull();
  });
});

describe("groupAssetsByCategory", () => {
  function makeAsset(overrides: Partial<Asset> = {}): Asset {
    return { id: "a1", name: "Asset", value: 100, currency: "USD", category: "other", ...overrides };
  }

  it("groups assets into financial, physical, business, and other buckets", () => {
    const assets = [
      makeAsset({ id: "a1", category: "cash" }),
      makeAsset({ id: "a2", category: "laptop" }),
      makeAsset({ id: "a3", category: "domains" }),
      makeAsset({ id: "a4", category: "other" }),
    ];
    const grouped = groupAssetsByCategory(assets);
    expect(grouped.financial.map((a) => a.id)).toEqual(["a1"]);
    expect(grouped.physical.map((a) => a.id)).toEqual(["a2"]);
    expect(grouped.business.map((a) => a.id)).toEqual(["a3"]);
    expect(grouped.other.map((a) => a.id)).toEqual(["a4"]);
  });

  it("returns empty groups for an empty list", () => {
    const grouped = groupAssetsByCategory([]);
    expect(grouped).toEqual({ financial: [], physical: [], business: [], other: [] });
  });
});

describe("calculateMonthsRemaining", () => {
  it("computes months needed to close the remaining gap", () => {
    expect(calculateMonthsRemaining(0, 1200, 400)).toBe(3);
  });

  it("rounds up a partial month", () => {
    expect(calculateMonthsRemaining(0, 1000, 400)).toBe(3);
  });

  it("returns null when already at or past target", () => {
    expect(calculateMonthsRemaining(1200, 1000, 400)).toBeNull();
  });

  it("returns null with no monthly contribution", () => {
    expect(calculateMonthsRemaining(0, 1000, 0)).toBeNull();
  });
});

describe("calculateSavingsRate", () => {
  it("sums contribution percentages of auto-funded savings goals only", () => {
    const goals = [
      makeGoal({ category: "rent", contributionPercentage: 12, isAutoFunded: true }),
      makeGoal({ category: "emergency", contributionPercentage: 12, isAutoFunded: true }),
      makeGoal({ category: "wedding", contributionPercentage: 8, isAutoFunded: true }),
      makeGoal({ category: "investment", contributionPercentage: 20, isAutoFunded: true }),
      makeGoal({ category: "business", contributionPercentage: 7, isAutoFunded: true }),
      makeGoal({ category: "custom", contributionPercentage: 50, isAutoFunded: true }),
    ];
    expect(calculateSavingsRate(goals)).toBe(59);
  });

  it("excludes goals that aren't auto-funded", () => {
    const goals = [makeGoal({ category: "rent", contributionPercentage: 12, isAutoFunded: false })];
    expect(calculateSavingsRate(goals)).toBe(0);
  });

  it("returns 0 for no goals", () => {
    expect(calculateSavingsRate([])).toBe(0);
  });
});

describe("calculateInvestmentRate", () => {
  it("returns the auto-funded investment goal's contribution percentage", () => {
    const goals = [makeGoal({ category: "investment", contributionPercentage: 20, isAutoFunded: true })];
    expect(calculateInvestmentRate(goals)).toBe(20);
  });

  it("returns 0 when there is no auto-funded investment goal", () => {
    expect(calculateInvestmentRate([makeGoal({ category: "investment", contributionPercentage: 20, isAutoFunded: false })])).toBe(0);
    expect(calculateInvestmentRate([])).toBe(0);
  });
});

describe("calculateNetWorthTrend", () => {
  it("returns the percent change from the earliest to the latest snapshot", () => {
    const snapshots = [makeSnapshot({ capturedAt: "2026-01-01", netWorth: 1000 }), makeSnapshot({ capturedAt: "2026-02-01", netWorth: 1100 })];
    expect(calculateNetWorthTrend(snapshots)).toBe(10);
  });

  it("returns null with fewer than 2 snapshots", () => {
    expect(calculateNetWorthTrend([makeSnapshot()])).toBeNull();
    expect(calculateNetWorthTrend([])).toBeNull();
  });

  it("sorts snapshots by date regardless of input order", () => {
    const snapshots = [makeSnapshot({ capturedAt: "2026-02-01", netWorth: 1200 }), makeSnapshot({ capturedAt: "2026-01-01", netWorth: 1000 })];
    expect(calculateNetWorthTrend(snapshots)).toBe(20);
  });
});

describe("calculateFinancialHealthScore", () => {
  it("averages the four sub-scores", () => {
    const score = calculateFinancialHealthScore({
      emergencyProgress: 100,
      savingsRate: 50,
      totalAssets: 1000,
      totalLiabilities: 0,
      netWorthTrend: 50,
    });
    expect(score).toBe(100);
  });

  it("treats missing net worth trend as neutral", () => {
    const score = calculateFinancialHealthScore({
      emergencyProgress: 0,
      savingsRate: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      netWorthTrend: null,
    });
    expect(score).toBe(Math.round((0 + 0 + 100 + 50) / 4));
  });
});

describe("getUpcomingGoalEvents", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns goals with a due date within the horizon, sorted ascending", () => {
    const goals = [
      makeGoal({ id: "g1", dueDate: "2026-08-01" }),
      makeGoal({ id: "g2", dueDate: "2026-03-01" }),
      makeGoal({ id: "g3", dueDate: "2028-01-01" }),
      makeGoal({ id: "g4", dueDate: undefined }),
    ];
    expect(getUpcomingGoalEvents(goals).map((goal) => goal.id)).toEqual(["g2", "g1"]);
  });

  it("excludes due dates in the past", () => {
    expect(getUpcomingGoalEvents([makeGoal({ dueDate: "2025-01-01" })])).toEqual([]);
  });
});

describe("generateCoachMessage", () => {
  const settings = { monthlyLivingExpenses: 500000, emergencyFundMonths: 6 };

  it("includes the savings rate and mentions rent and wedding goal progress", () => {
    const goals = [
      makeGoal({ category: "rent", contributionPercentage: 12, isAutoFunded: true, name: "Annual Rent", targetAmount: 1200, currentAmount: 0 }),
      makeGoal({ category: "wedding", contributionPercentage: 8, isAutoFunded: true, name: "Wedding Fund", targetAmount: 9600, currentAmount: 0 }),
    ];
    const message = generateCoachMessage({ fullName: "Robert", goals, monthlyIncomeLocal: 1000, settings });
    expect(message).toContain("Robert");
    expect(message).toMatch(/savings rate is 20%/);
    expect(message).toContain("on track to fund annual rent by");
    expect(message).toMatch(/reach your wedding fund in \d+ year/);
    expect(message).toContain("Keep going.");
  });

  it("says the rent goal is already funded when current amount meets target", () => {
    const goals = [makeGoal({ category: "rent", contributionPercentage: 12, isAutoFunded: true, name: "Annual Rent", targetAmount: 100, currentAmount: 200 })];
    const message = generateCoachMessage({ fullName: null, goals, monthlyIncomeLocal: 1000, settings });
    expect(message).toContain("already fully funded");
    expect(message.startsWith("Good")).toBe(true);
  });
});

describe("calculateReviewSavingsRate", () => {
  it("computes savings as a percentage of planned spend", () => {
    expect(calculateReviewSavingsRate(300, 1000)).toBe(30);
  });

  it("returns 0 when planned spend is 0 to avoid dividing by zero", () => {
    expect(calculateReviewSavingsRate(300, 0)).toBe(0);
  });

  it("allows a negative rate when savings are negative", () => {
    expect(calculateReviewSavingsRate(-200, 1000)).toBe(-20);
  });
});

describe("generateReviewSummary", () => {
  it("summarizes income, expenses, and the top expense category for the month", () => {
    const transactions = [
      makeTransaction({ type: "income", convertedAmount: 5000, date: "2026-07-01", category: "Salary" }),
      makeTransaction({ type: "expense", convertedAmount: 1200, date: "2026-07-05", category: "Food" }),
      makeTransaction({ type: "expense", convertedAmount: 300, date: "2026-07-10", category: "Transport" }),
      makeTransaction({ type: "expense", convertedAmount: 999, date: "2026-08-01", category: "Food" }),
    ];
    const summary = generateReviewSummary(transactions, "2026-07", "USD");
    expect(summary).toContain("across 2 expense transactions");
    expect(summary).toContain("biggest expense category was Food");
    expect(summary).toContain("saved");
  });

  it("notes a shortfall when expenses exceed income", () => {
    const transactions = [
      makeTransaction({ type: "income", convertedAmount: 500, date: "2026-07-01" }),
      makeTransaction({ type: "expense", convertedAmount: 800, date: "2026-07-02", category: "Shopping" }),
    ];
    expect(generateReviewSummary(transactions, "2026-07", "USD")).toContain("more than you earned");
  });

  it("returns a placeholder message when there are no transactions that month", () => {
    expect(generateReviewSummary([makeTransaction({ date: "2026-01-01" })], "2026-07", "USD")).toBe("No transactions recorded this month yet.");
  });
});
