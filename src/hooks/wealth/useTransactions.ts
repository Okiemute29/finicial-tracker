import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import type { TransactionFormValues } from "../../component/wealth/transactions/TransactionFormModal";
import { convertCurrency } from "../../helpers/currencyHelpers";
import type { Transaction } from "../../models/wealth/types";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";
import { useWealthSnapshot } from "./useWealthSnapshot";

export function useTransactions() {
  const { transactions, settings, activeExchangeRate } = useWealthSnapshot();
  const setTransactions = useWealthStore((state) => state.setTransactions);
  const setGoals = useWealthStore((state) => state.setGoals);

  function computeConvertedAmount(amount: number, currency: string): number {
    if (currency === settings.spendingCurrency) return amount;
    return convertCurrency(amount, activeExchangeRate);
  }

  function buildTransaction(values: TransactionFormValues, existingId?: string): Transaction {
    const categoryId = values.type === "expense" && values.categoryId ? values.categoryId : undefined;
    const convertedAmount = computeConvertedAmount(values.amount, values.currency);
    return { id: existingId ?? crypto.randomUUID(), ...values, categoryId, convertedAmount };
  }

  async function refreshGoalsAfterAllocation() {
    try {
      setGoals(await wealthService.getGoals());
    } catch {
      // Best-effort refresh — the DB trigger already applied the allocation regardless;
      // a failed refetch just means the Goals page shows stale balances until next load.
    }
  }

  async function createTransaction(values: TransactionFormValues): Promise<boolean> {
    try {
      const created = buildTransaction(values);
      await wealthService.createTransaction(created);
      setTransactions([created, ...transactions]);
      if (created.type === "income") {
        await refreshGoalsAfterAllocation();
        Success("Transaction added. Goal balances updated.");
      } else {
        Success("Transaction added.");
      }
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save transaction.");
      return false;
    }
  }

  async function updateTransaction(existing: Transaction, values: TransactionFormValues): Promise<boolean> {
    try {
      const updated = buildTransaction(values, existing.id);
      await wealthService.updateTransaction(updated);
      setTransactions(transactions.map((transaction) => (transaction.id === updated.id ? updated : transaction)));
      if (existing.type === "expense" && updated.type === "income") {
        await refreshGoalsAfterAllocation();
        Success("Transaction updated. Goal balances updated.");
      } else {
        Success("Transaction updated.");
      }
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save transaction.");
      return false;
    }
  }

  async function deleteTransaction(transaction: Transaction): Promise<boolean> {
    try {
      await wealthService.deleteTransaction(transaction.id);
      setTransactions(transactions.filter((item) => item.id !== transaction.id));
      Success("Transaction deleted.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to delete transaction.");
      return false;
    }
  }

  return { transactions, createTransaction, updateTransaction, deleteTransaction };
}
