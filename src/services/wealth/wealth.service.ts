import type { Asset, BudgetCategory, FinancialSettings, Goal, Liability, MonthlyReview, Transaction } from "../../models/wealth/types";
import { assets, budgetCategories, financialSettings, goals, liabilities, monthlyReviews, transactions } from "../../mocks/wealth.mock";
import { supabase } from "../supabase/client";
import {
  mapAssetRow,
  mapBudgetCategoryRow,
  mapFinancialSettingsRow,
  mapGoalRow,
  mapIncomeSourceRow,
  mapLiabilityRow,
  mapMonthlyReviewRow,
  mapTransactionRow,
} from "./wealth.mappers";
import type {
  AssetRow,
  BudgetCategoryRow,
  FinancialSettingsRow,
  GoalRow,
  IncomeSourceRow,
  LiabilityRow,
  MonthlyReviewRow,
  TransactionRow,
} from "./wealth.mappers";

async function getFinancialSettings(): Promise<FinancialSettings> {
  if (!supabase) return financialSettings;

  const [settingsResult, incomeResult] = await Promise.all([
    supabase.from("financial_settings").select("*").single(),
    supabase.from("income_sources").select("*"),
  ]);
  if (settingsResult.error) throw settingsResult.error;
  if (incomeResult.error) throw incomeResult.error;

  const incomeSources = ((incomeResult.data ?? []) as IncomeSourceRow[]).map(mapIncomeSourceRow);
  return mapFinancialSettingsRow(settingsResult.data as FinancialSettingsRow, incomeSources);
}

async function getBudgetCategories(): Promise<BudgetCategory[]> {
  if (!supabase) return budgetCategories;
  const { data, error } = await supabase.from("budget_categories").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as BudgetCategoryRow[]).map(mapBudgetCategoryRow);
}

async function getGoals(): Promise<Goal[]> {
  if (!supabase) return goals;
  const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as GoalRow[]).map(mapGoalRow);
}

async function getTransactions(): Promise<Transaction[]> {
  if (!supabase) return transactions;
  const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as TransactionRow[]).map(mapTransactionRow);
}

async function getAssets(): Promise<Asset[]> {
  if (!supabase) return assets;
  const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as AssetRow[]).map(mapAssetRow);
}

async function getLiabilities(): Promise<Liability[]> {
  if (!supabase) return liabilities;
  const { data, error } = await supabase.from("liabilities").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as LiabilityRow[]).map(mapLiabilityRow);
}

async function getMonthlyReviews(): Promise<MonthlyReview[]> {
  if (!supabase) return monthlyReviews;
  const { data, error } = await supabase.from("monthly_reviews").select("*").order("month", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as MonthlyReviewRow[]).map(mapMonthlyReviewRow);
}

async function updateCachedExchangeRate(rate: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("financial_settings").update({ cached_exchange_rate: rate });
  if (error) throw error;
}

type ExchangeRateSnapshotInput = {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: "api" | "manual" | "cached";
};

async function recordExchangeRateSnapshot(input: ExchangeRateSnapshotInput): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("exchange_rate_snapshots").insert({
    base_currency: input.baseCurrency,
    quote_currency: input.quoteCurrency,
    rate: input.rate,
    source: input.source,
  });
  if (error) throw error;
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
  updateCachedExchangeRate,
  recordExchangeRateSnapshot,
};
