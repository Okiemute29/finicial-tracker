export type CurrencyCode = "USD" | "NGN" | "GBP" | "EUR" | string;

export type IncomeSource = {
  id: string;
  label: string;
  amount: number;
  currency: CurrencyCode;
  cadence: "monthly" | "weekly" | "annual" | "one_time";
};

export type ThemePreference = "light" | "dark" | "system";

export type FinancialSettings = {
  userId: string;
  fullName: string | null;
  earningCurrency: CurrencyCode;
  spendingCurrency: CurrencyCode;
  manualExchangeRateEnabled: boolean;
  manualExchangeRate: number | null;
  cachedExchangeRate: number;
  monthlyLivingExpenses: number;
  emergencyFundMonths: number;
  emailAlertsEnabled: boolean;
  theme: ThemePreference;
  incomeSources: IncomeSource[];
};

export type BudgetCategory = {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
  sortOrder: number;
  linkedGoalId?: string;
};

export type GoalStatus = "active" | "completed" | "paused";
export type GoalCategory = "rent" | "emergency" | "wedding" | "investment" | "business" | "custom";
export type GoalPriority = "critical" | "high" | "medium" | "low";
export type GoalTargetType = "fixed" | "ongoing";

export type Goal = {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  contributionPercentage: number;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  status: GoalStatus;
  targetType: GoalTargetType;
  isAutoFunded: boolean;
  dueDate?: string;
};

export type GoalAllocation = {
  id: string;
  transactionId: string;
  goalId: string;
  amount: number;
  createdAt: string;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  categoryId?: string;
  category?: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  convertedAmount: number;
  date: string;
};

export type AssetCategory =
  | "cash"
  | "bank_account"
  | "savings"
  | "investments"
  | "solar_system"
  | "laptop"
  | "phone"
  | "car"
  | "property"
  | "domains"
  | "websites"
  | "equipment"
  | "business_cash"
  | "other";

export type LiabilityCategory = "personal_loan" | "car_loan" | "mortgage" | "credit_card_debt" | "money_owed" | "other_debt";

export type Asset = {
  id: string;
  name: string;
  value: number;
  currency: CurrencyCode;
  category: AssetCategory;
};

export type Liability = {
  id: string;
  name: string;
  value: number;
  currency: CurrencyCode;
  category: LiabilityCategory;
};

export type MonthlyReview = {
  id: string;
  month: string;
  plannedSpend: number;
  actualSpend: number;
  savings: number;
  savingsRate?: number;
  netWorthSnapshot?: number;
  notes: string;
  whatWentWell?: string;
  whatCouldImprove?: string;
  biggestWin?: string;
  lessonsLearned?: string;
  autoSummary?: string;
};

export type ExchangeRateSnapshot = {
  id: string;
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  rate: number;
  source: "api" | "manual" | "cached";
  capturedAt: string;
};

export type NetWorthSnapshot = {
  id: string;
  capturedAt: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
};
