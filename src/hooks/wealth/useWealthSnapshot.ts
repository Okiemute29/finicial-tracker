import { useMemo } from "react";
import { useWealthStore } from "../../stores/wealthStore";
import { calculateNetWorth, summarizeTransactions } from "../../helpers/wealthCalculations";

export function useWealthSnapshot() {
  const state = useWealthStore();

  return useMemo(() => {
    const monthlyIncome = state.settings.incomeSources.reduce((sum, item) => sum + item.amount, 0);
    const activeExchangeRate = state.settings.manualExchangeRateEnabled && state.settings.manualExchangeRate
      ? state.settings.manualExchangeRate
      : state.settings.cachedExchangeRate;
    const transactionSummary = summarizeTransactions(state.transactions);
    const netWorth = calculateNetWorth(state.assets, state.liabilities);

    return {
      ...state,
      monthlyIncome,
      activeExchangeRate,
      transactionSummary,
      netWorth,
    };
  }, [state]);
}
