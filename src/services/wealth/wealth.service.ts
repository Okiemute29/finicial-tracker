import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, MonthlyReview, Transaction } from "../../models/wealth/types";
import { assets, budgetCategories, financialSettings, goals, liabilities, monthlyReviews, transactions } from "../../mocks/wealth.mock";

async function getFinancialSettings(): Promise<FinancialSettings> {
  return financialSettings;
}

async function getBudgetCategories(): Promise<BudgetCategory[]> {
  return budgetCategories;
}

async function getGoals(): Promise<Goal[]> {
  return goals;
}

async function getTransactions(): Promise<Transaction[]> {
  return transactions;
}

async function getAssets(): Promise<Asset[]> {
  return assets;
}

async function getLiabilities(): Promise<Liability[]> {
  return liabilities;
}

async function getMonthlyReviews(): Promise<MonthlyReview[]> {
  return monthlyReviews;
}

async function getDashboardSnapshot() {
  const [settings, budget, goalList, transactionList, assetList, liabilityList, reviews] = await Promise.all([
    getFinancialSettings(),
    getBudgetCategories(),
    getGoals(),
    getTransactions(),
    getAssets(),
    getLiabilities(),
    getMonthlyReviews(),
  ]);

  return {
    financialSettings: settings,
    budgetCategories: budget,
    goals: goalList,
    transactions: transactionList,
    assets: assetList,
    liabilities: liabilityList,
    monthlyReviews: reviews,
  };
}

export const wealthService = {
  getFinancialSettings,
  getBudgetCategories,
  getGoals,
  getTransactions,
  getAssets,
  getLiabilities,
  getMonthlyReviews,
  getDashboardSnapshot,
};
