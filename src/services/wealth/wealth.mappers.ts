import type { Asset, BudgetCategory, FinancialSettings, Goal, IncomeSource, Liability, MonthlyReview, Transaction } from "../../models/wealth/types";

export type FinancialSettingsRow = {
  user_id: string;
  earning_currency: string;
  spending_currency: string;
  manual_exchange_rate_enabled: boolean;
  manual_exchange_rate: number | null;
  cached_exchange_rate: number;
};

export type IncomeSourceRow = {
  id: string;
  label: string;
  amount: number;
  currency: string;
  cadence: IncomeSource["cadence"];
};

export type BudgetCategoryRow = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  sort_order: number;
};

export type GoalRow = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  status: Goal["status"];
  due_date: string | null;
};

export type TransactionRow = {
  id: string;
  type: Transaction["type"];
  category_id: string | null;
  description: string;
  amount: number;
  currency: string;
  converted_amount: number;
  date: string;
};

export type AssetRow = {
  id: string;
  name: string;
  value: number;
  currency: string;
};

export type LiabilityRow = AssetRow;

export type MonthlyReviewRow = {
  id: string;
  month: string;
  planned_spend: number;
  actual_spend: number;
  savings: number;
  notes: string;
};

export function mapFinancialSettingsRow(row: FinancialSettingsRow, incomeSources: IncomeSource[]): FinancialSettings {
  return {
    userId: row.user_id,
    earningCurrency: row.earning_currency,
    spendingCurrency: row.spending_currency,
    manualExchangeRateEnabled: row.manual_exchange_rate_enabled,
    manualExchangeRate: row.manual_exchange_rate,
    cachedExchangeRate: Number(row.cached_exchange_rate),
    incomeSources,
  };
}

export function mapIncomeSourceRow(row: IncomeSourceRow): IncomeSource {
  return {
    id: row.id,
    label: row.label,
    amount: Number(row.amount),
    currency: row.currency,
    cadence: row.cadence,
  };
}

export function mapBudgetCategoryRow(row: BudgetCategoryRow): BudgetCategory {
  return {
    id: row.id,
    name: row.name,
    percentage: Number(row.percentage),
    color: row.color,
    sortOrder: row.sort_order,
  };
}

export function mapGoalRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    currency: row.currency,
    status: row.status,
    dueDate: row.due_date ?? undefined,
  };
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    categoryId: row.category_id ?? undefined,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    convertedAmount: Number(row.converted_amount),
    date: row.date,
  };
}

export function mapAssetRow(row: AssetRow): Asset {
  return { id: row.id, name: row.name, value: Number(row.value), currency: row.currency };
}

export function mapLiabilityRow(row: LiabilityRow): Liability {
  return { id: row.id, name: row.name, value: Number(row.value), currency: row.currency };
}

export function mapMonthlyReviewRow(row: MonthlyReviewRow): MonthlyReview {
  return {
    id: row.id,
    month: row.month.slice(0, 7),
    plannedSpend: Number(row.planned_spend),
    actualSpend: Number(row.actual_spend),
    savings: Number(row.savings),
    notes: row.notes,
  };
}
