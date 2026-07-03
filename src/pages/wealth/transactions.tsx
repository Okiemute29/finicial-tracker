import StatusBadge from "../../component/badge/statusbadge";
import DataTable from "../../component/table/data.table";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

export default function TransactionsPage() {
  const { transactions, settings } = useWealthSnapshot();
  return (
    <div className="space-y-5">
      <div>
        <Text size="2xl" className="font-bold text-slate-950">Transactions</Text>
        <Text size="sm" className="text-slate-500">Income and expense records with converted local values.</Text>
      </div>
      <DataTable
        columns={[{ header: "Date" }, { header: "Description" }, { header: "Type" }, { header: "Amount" }, { header: "Converted" }]}
        data={transactions}
        renderRow={(transaction) => (
          <>
            <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 text-slate-600">{transaction.date}</td>
            <td className="border-y border-slate-200 px-4 py-4 font-medium text-slate-900">{transaction.description}</td>
            <td className="border-y border-slate-200 px-4 py-4"><StatusBadge label={transaction.type} /></td>
            <td className="border-y border-slate-200 px-4 py-4">{formatCurrency(transaction.amount, transaction.currency)}</td>
            <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4">{formatCurrency(transaction.convertedAmount, settings.spendingCurrency)}</td>
          </>
        )}
      />
    </div>
  );
}
