import { useMemo, useState } from "react";
import StatusBadge from "../../component/badge/statusbadge";
import Button from "../../component/buttons/button";
import DataTable from "../../component/table/data.table";
import Icon from "../../component/icon/icons";
import Text from "../../component/typography/typography";
import TransactionFormModal from "../../component/wealth/transactions/TransactionFormModal";
import type { TransactionFormValues } from "../../component/wealth/transactions/TransactionFormModal";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { useTransactions } from "../../hooks/wealth/useTransactions";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import type { Transaction } from "../../models/wealth/types";

export default function TransactionsPage() {
  const { settings, budgetCategories } = useWealthSnapshot();
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const currencyOptions = useMemo(() => {
    const options = [
      { label: settings.spendingCurrency, value: settings.spendingCurrency },
      { label: settings.earningCurrency, value: settings.earningCurrency },
    ];
    return options.filter((option, index) => options.findIndex((item) => item.value === option.value) === index);
  }, [settings.spendingCurrency, settings.earningCurrency]);

  function openCreateModal() {
    setEditingTransaction(undefined);
    setModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
  }

  async function handleSubmit(values: TransactionFormValues) {
    setSubmitting(true);
    const success = editingTransaction ? await updateTransaction(editingTransaction, values) : await createTransaction(values);
    setSubmitting(false);
    if (success) setModalOpen(false);
  }

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm(`Delete "${transaction.description}"? This can't be undone.`)) return;
    await deleteTransaction(transaction);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text size="2xl" className="font-bold text-slate-950">Transactions</Text>
          <Text size="sm" className="text-slate-500">Income and expense records with converted local values.</Text>
        </div>
        <Button size="sm" leftIcon="plus" onClick={openCreateModal} type="button">New transaction</Button>
      </div>
      <DataTable
        columns={[{ header: "Date" }, { header: "Description" }, { header: "Type" }, { header: "Category" }, { header: "Amount" }, { header: "Converted" }, { header: "" }]}
        data={transactions}
        renderRow={(transaction) => (
          <>
            <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 text-slate-600">{transaction.date}</td>
            <td className="border-y border-slate-200 px-4 py-4 font-medium text-slate-900">{transaction.description}</td>
            <td className="border-y border-slate-200 px-4 py-4"><StatusBadge label={transaction.type} /></td>
            <td className="border-y border-slate-200 px-4 py-4 text-slate-600">{transaction.category ?? "—"}</td>
            <td className="border-y border-slate-200 px-4 py-4">{formatCurrency(transaction.amount, transaction.currency)}</td>
            <td className="border-y border-slate-200 px-4 py-4">{formatCurrency(transaction.convertedAmount, settings.spendingCurrency)}</td>
            <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4">
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => openEditModal(transaction)} className="text-slate-400 transition hover:text-teal-700" aria-label={`Edit ${transaction.description}`}>
                  <Icon name="edit" iconClass="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(transaction)} className="text-slate-400 transition hover:text-red-600" aria-label={`Delete ${transaction.description}`}>
                  <Icon name="trash" iconClass="h-4 w-4" />
                </button>
              </div>
            </td>
          </>
        )}
      />

      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValue={editingTransaction}
        submitting={submitting}
        budgetCategories={budgetCategories}
        currencyOptions={currencyOptions}
        defaultCurrency={settings.spendingCurrency}
      />
    </div>
  );
}
