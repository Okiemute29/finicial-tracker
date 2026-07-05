import { describe, expect, it } from "vitest";
import type { Asset, BudgetCategory, Liability, Transaction } from "../models/wealth/types";
import {
  budgetPercentageTotal,
  calculateBudgetAmount,
  calculateGoalProgress,
  calculateNetWorth,
  calculateOverspend,
  isBudgetBalanced,
  summarizeMonthlyTransactions,
  summarizeTransactions,
} from "./wealthCalculations";

function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return { id: "cat-1", name: "Rent", description: "", percentage: 30, color: "#000", sortOrder: 1, ...overrides };
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return { id: "tx-1", type: "expense", description: "Groceries", amount: 100, currency: "USD", convertedAmount: 100, date: "2026-07-01", ...overrides };
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
      { id: "a1", name: "Savings", value: 8000, currency: "USD" },
      { id: "a2", name: "Car", value: 5000, currency: "USD" },
    ];
    const liabilities: Liability[] = [{ id: "l1", name: "Loan", value: 3000, currency: "USD" }];
    expect(calculateNetWorth(assets, liabilities)).toEqual({ totalAssets: 13000, totalLiabilities: 3000, netWorth: 10000 });
  });

  it("handles no assets or liabilities", () => {
    expect(calculateNetWorth([], [])).toEqual({ totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
  });

  it("allows a negative net worth when liabilities exceed assets", () => {
    const assets: Asset[] = [{ id: "a1", name: "Cash", value: 1000, currency: "USD" }];
    const liabilities: Liability[] = [{ id: "l1", name: "Debt", value: 5000, currency: "USD" }];
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
