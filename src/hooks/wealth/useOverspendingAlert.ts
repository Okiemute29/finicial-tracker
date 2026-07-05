import { useEffect, useRef } from "react";
import { Warning } from "../../component/toastify/toastify";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { calculateOverspend, summarizeMonthlyTransactions } from "../../helpers/wealthCalculations";
import { useWealthStore } from "../../stores/wealthStore";
import { useWealthSnapshot } from "./useWealthSnapshot";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useOverspendingAlert() {
  const status = useWealthStore((state) => state.status);
  const { transactions, monthlyIncome, activeExchangeRate, settings } = useWealthSnapshot();
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (status !== "loaded" || hasWarnedRef.current) return;
    hasWarnedRef.current = true;

    const plannedSpend = monthlyIncome * activeExchangeRate;
    const { expenses: actualSpend } = summarizeMonthlyTransactions(transactions, currentMonth());
    const over = calculateOverspend(actualSpend, plannedSpend);

    if (over > 0) {
      Warning(`You've spent ${formatCurrency(over, settings.spendingCurrency)} more than planned this month.`);
    }
  }, [status, transactions, monthlyIncome, activeExchangeRate, settings]);
}
