export type CurrencyCode = "USD" | "NGN" | "GBP" | "EUR" | string;

export type IncomeSource = {
  id: string;
  label: string;
  amount: number;
  currency: CurrencyCode;
  cadence: "monthly" | "weekly" | "annual" | "one_time";
};

export type FinancialSettings = {
  userId: string;
  earningCurrency: CurrencyCode;
  spendingCurrency: CurrencyCode;
  manualExchangeRateEnabled: boolean;
  manualExchangeRate: number | null;
  cachedExchangeRate: number;
  incomeSources: IncomeSource[];
};

export type BudgetCategory = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  sortOrder: number;
};

export type GoalStatus = "active" | "completed" | "paused";

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  status: GoalStatus;
  dueDate?: string;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  categoryId?: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  convertedAmount: number;
  date: string;
};

export type Asset = {
  id: string;
  name: string;
  value: number;
  currency: CurrencyCode;
};

export type Liability = {
  id: string;
  name: string;
  value: number;
  currency: CurrencyCode;
};

export type MonthlyReview = {
  id: string;
  month: string;
  plannedSpend: number;
  actualSpend: number;
  savings: number;
  notes: string;
};

export type ExchangeRateSnapshot = {
  id: string;
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  rate: number;
  source: "api" | "manual" | "cached";
  capturedAt: string;
};
