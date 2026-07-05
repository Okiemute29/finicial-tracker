import type {
  Asset,
  AssetCategory,
  BudgetCategory,
  FinancialSettings,
  Goal,
  GoalAllocation,
  GoalCategory,
  GoalPriority,
  GoalTargetType,
  IncomeSource,
  Liability,
  LiabilityCategory,
  MonthlyReview,
  NetWorthSnapshot,
  ThemePreference,
  Transaction,
} from "../../models/wealth/types";

export type FinancialSettingsRow = {
  user_id: string;
  full_name: string | null;
  earning_currency: string;
  spending_currency: string;
  manual_exchange_rate_enabled: boolean;
  manual_exchange_rate: number | null;
  cached_exchange_rate: number;
  monthly_living_expenses: number;
  emergency_fund_months: number;
  email_alerts_enabled: boolean;
  theme: ThemePreference;
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
  description: string;
  percentage: number;
  color: string;
  sort_order: number;
  linked_goal_id: string | null;
};

export type GoalRow = {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  contribution_percentage: number;
  target_amount: number;
  current_amount: number;
  currency: string;
  status: Goal["status"];
  target_type: GoalTargetType;
  is_auto_funded: boolean;
  due_date: string | null;
};

export type GoalAllocationRow = {
  id: string;
  transaction_id: string;
  goal_id: string;
  amount: number;
  created_at: string;
};

export type TransactionRow = {
  id: string;
  type: Transaction["type"];
  category_id: string | null;
  category: string | null;
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
  category: AssetCategory;
};

export type LiabilityRow = {
  id: string;
  name: string;
  value: number;
  currency: string;
  category: LiabilityCategory;
};

export type MonthlyReviewRow = {
  id: string;
  month: string;
  planned_spend: number;
  actual_spend: number;
  savings: number;
  savings_rate: number;
  net_worth_snapshot: number;
  notes: string;
  what_went_well: string;
  what_could_improve: string;
  biggest_win: string;
  lessons_learned: string;
  auto_summary: string;
};

export type NetWorthSnapshotRow = {
  id: string;
  captured_at: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
};

export function mapFinancialSettingsRow(row: FinancialSettingsRow, incomeSources: IncomeSource[]): FinancialSettings {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    earningCurrency: row.earning_currency,
    spendingCurrency: row.spending_currency,
    manualExchangeRateEnabled: row.manual_exchange_rate_enabled,
    manualExchangeRate: row.manual_exchange_rate,
    cachedExchangeRate: Number(row.cached_exchange_rate),
    monthlyLivingExpenses: Number(row.monthly_living_expenses),
    emergencyFundMonths: Number(row.emergency_fund_months),
    emailAlertsEnabled: row.email_alerts_enabled,
    theme: row.theme,
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
    description: row.description,
    percentage: Number(row.percentage),
    color: row.color,
    sortOrder: row.sort_order,
    linkedGoalId: row.linked_goal_id ?? undefined,
  };
}

export function mapGoalRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priority: row.priority,
    contributionPercentage: Number(row.contribution_percentage),
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    currency: row.currency,
    status: row.status,
    targetType: row.target_type,
    isAutoFunded: row.is_auto_funded,
    dueDate: row.due_date ?? undefined,
  };
}

export function mapGoalAllocationRow(row: GoalAllocationRow): GoalAllocation {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    goalId: row.goal_id,
    amount: Number(row.amount),
    createdAt: row.created_at,
  };
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    categoryId: row.category_id ?? undefined,
    category: row.category ?? undefined,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    convertedAmount: Number(row.converted_amount),
    date: row.date,
  };
}

export function mapAssetRow(row: AssetRow): Asset {
  return { id: row.id, name: row.name, value: Number(row.value), currency: row.currency, category: row.category };
}

export function mapLiabilityRow(row: LiabilityRow): Liability {
  return { id: row.id, name: row.name, value: Number(row.value), currency: row.currency, category: row.category };
}

export function mapMonthlyReviewRow(row: MonthlyReviewRow): MonthlyReview {
  return {
    id: row.id,
    month: row.month.slice(0, 7),
    plannedSpend: Number(row.planned_spend),
    actualSpend: Number(row.actual_spend),
    savings: Number(row.savings),
    savingsRate: Number(row.savings_rate),
    netWorthSnapshot: Number(row.net_worth_snapshot),
    notes: row.notes,
    whatWentWell: row.what_went_well,
    whatCouldImprove: row.what_could_improve,
    biggestWin: row.biggest_win,
    lessonsLearned: row.lessons_learned,
    autoSummary: row.auto_summary,
  };
}

export function mapNetWorthSnapshotRow(row: NetWorthSnapshotRow): NetWorthSnapshot {
  return {
    id: row.id,
    capturedAt: row.captured_at,
    totalAssets: Number(row.total_assets),
    totalLiabilities: Number(row.total_liabilities),
    netWorth: Number(row.net_worth),
  };
}
