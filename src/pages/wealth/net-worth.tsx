import DataTable from "../../component/table/data.table";
import MetricCard from "../../component/wealth/dashboard/MetricCard";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

export default function NetWorthPage() {
  const { assets, liabilities, netWorth, settings } = useWealthSnapshot();
  return (
    <div className="space-y-6">
      <div>
        <Text size="2xl" className="font-bold text-slate-950">Net Worth</Text>
        <Text size="sm" className="text-slate-500">Assets minus liabilities.</Text>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Total Assets" value={formatCurrency(netWorth.totalAssets, settings.earningCurrency)} icon="trend" />
        <MetricCard label="Total Liabilities" value={formatCurrency(netWorth.totalLiabilities, settings.earningCurrency)} icon="transaction" />
        <MetricCard accent label="Net Worth" value={formatCurrency(netWorth.netWorth, settings.earningCurrency)} icon="netWorth" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <Text size="lg" className="mb-3 font-semibold text-slate-950">Assets</Text>
          <DataTable columns={[{ header: "Asset" }, { header: "Value" }]} data={assets} renderRow={(asset) => <><td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium">{asset.name}</td><td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4">{formatCurrency(asset.value, asset.currency)}</td></>} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <Text size="lg" className="mb-3 font-semibold text-slate-950">Liabilities</Text>
          <DataTable columns={[{ header: "Liability" }, { header: "Value" }]} data={liabilities} renderRow={(liability) => <><td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium">{liability.name}</td><td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4">{formatCurrency(liability.value, liability.currency)}</td></>} />
        </section>
      </div>
    </div>
  );
}
