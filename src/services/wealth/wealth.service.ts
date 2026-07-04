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

async function getCurrentUserId(): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user.id;
  if (!userId) throw new Error("Not authenticated.");
  return userId;
}

function toBudgetCategoryPayload(category: BudgetCategory) {
  return {
    name: category.name,
    description: category.description,
    percentage: category.percentage,
    color: category.color,
    sort_order: category.sortOrder,
  };
}

async function createBudgetCategory(category: BudgetCategory, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("budget_categories").insert({ id: category.id, user_id: userId, ...toBudgetCategoryPayload(category) });
  if (error) throw error;
}

async function updateBudgetCategory(category: BudgetCategory): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("budget_categories").update(toBudgetCategoryPayload(category)).eq("id", category.id);
  if (error) throw error;
}

async function deleteBudgetCategory(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("budget_categories").delete().eq("id", id);
  if (error) throw error;
}

async function syncBudgetCategories(previous: BudgetCategory[], next: BudgetCategory[]): Promise<void> {
  if (!supabase) return;

  const previousIds = new Set(previous.map((category) => category.id));
  const nextIds = new Set(next.map((category) => category.id));

  const toDelete = previous.filter((category) => !nextIds.has(category.id));
  const toCreate = next.filter((category) => !previousIds.has(category.id));
  const toUpdate = next.filter((category) => {
    const original = previous.find((item) => item.id === category.id);
    return Boolean(original) && JSON.stringify(original) !== JSON.stringify(category);
  });

  if (!toDelete.length && !toCreate.length && !toUpdate.length) return;

  const userId = toCreate.length ? await getCurrentUserId() : "";

  await Promise.all([
    ...toDelete.map((category) => deleteBudgetCategory(category.id)),
    ...toCreate.map((category) => createBudgetCategory(category, userId)),
    ...toUpdate.map((category) => updateBudgetCategory(category)),
  ]);
}

async function getGoals(): Promise<Goal[]> {
  if (!supabase) return goals;
  const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as GoalRow[]).map(mapGoalRow);
}

function toGoalPayload(goal: Goal) {
  return {
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    currency: goal.currency,
    status: goal.status,
    due_date: goal.dueDate ?? null,
  };
}

async function createGoal(goal: Goal): Promise<void> {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("goals").insert({ id: goal.id, user_id: userId, ...toGoalPayload(goal) });
  if (error) throw error;
}

async function updateGoal(goal: Goal): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("goals").update(toGoalPayload(goal)).eq("id", goal.id);
  if (error) throw error;
}

async function deleteGoal(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

async function getTransactions(): Promise<Transaction[]> {
  if (!supabase) return transactions;
  const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as TransactionRow[]).map(mapTransactionRow);
}

function toTransactionPayload(transaction: Transaction) {
  return {
    type: transaction.type,
    category_id: transaction.categoryId ?? null,
    description: transaction.description,
    amount: transaction.amount,
    currency: transaction.currency,
    converted_amount: transaction.convertedAmount,
    date: transaction.date,
  };
}

async function createTransaction(transaction: Transaction): Promise<void> {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("transactions").insert({ id: transaction.id, user_id: userId, ...toTransactionPayload(transaction) });
  if (error) throw error;
}

async function updateTransaction(transaction: Transaction): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("transactions").update(toTransactionPayload(transaction)).eq("id", transaction.id);
  if (error) throw error;
}

async function deleteTransaction(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
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

function toNetWorthItemPayload(item: Asset | Liability) {
  return { name: item.name, value: item.value, currency: item.currency };
}

async function createNetWorthItem(table: "assets" | "liabilities", item: Asset | Liability, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(table).insert({ id: item.id, user_id: userId, ...toNetWorthItemPayload(item) });
  if (error) throw error;
}

async function updateNetWorthItem(table: "assets" | "liabilities", item: Asset | Liability): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(table).update(toNetWorthItemPayload(item)).eq("id", item.id);
  if (error) throw error;
}

async function deleteNetWorthItem(table: "assets" | "liabilities", id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

async function createAsset(asset: Asset): Promise<void> {
  const userId = await getCurrentUserId();
  await createNetWorthItem("assets", asset, userId);
}

async function updateAsset(asset: Asset): Promise<void> {
  await updateNetWorthItem("assets", asset);
}

async function deleteAsset(id: string): Promise<void> {
  await deleteNetWorthItem("assets", id);
}

async function createLiability(liability: Liability): Promise<void> {
  const userId = await getCurrentUserId();
  await createNetWorthItem("liabilities", liability, userId);
}

async function updateLiability(liability: Liability): Promise<void> {
  await updateNetWorthItem("liabilities", liability);
}

async function deleteLiability(id: string): Promise<void> {
  await deleteNetWorthItem("liabilities", id);
}

async function getMonthlyReviews(): Promise<MonthlyReview[]> {
  if (!supabase) return monthlyReviews;
  const { data, error } = await supabase.from("monthly_reviews").select("*").order("month", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as MonthlyReviewRow[]).map(mapMonthlyReviewRow);
}

async function upsertMonthlyReview(review: MonthlyReview): Promise<void> {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("monthly_reviews").upsert(
    {
      id: review.id,
      user_id: userId,
      month: `${review.month}-01`,
      planned_spend: review.plannedSpend,
      actual_spend: review.actualSpend,
      savings: review.savings,
      notes: review.notes,
    },
    { onConflict: "user_id,month" },
  );
  if (error) throw error;
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
  syncBudgetCategories,
  createGoal,
  updateGoal,
  deleteGoal,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createAsset,
  updateAsset,
  deleteAsset,
  createLiability,
  updateLiability,
  deleteLiability,
  upsertMonthlyReview,
};
