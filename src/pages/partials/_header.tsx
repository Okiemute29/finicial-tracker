import Button from "../../component/buttons/button";
import Text from "../../component/typography/typography";
import { useSignOut } from "../../hooks/auth/useSignOut";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import { formatCurrency } from "../../helpers/currencyHelpers";

export default function Header() {
  const { monthlyIncome, settings, activeExchangeRate } = useWealthSnapshot();
  const signOut = useSignOut();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div>
        <Text size="xl" className="font-bold text-slate-950">Wealth System</Text>
        <Text size="sm" className="text-slate-500">Plan by percentages, spend in local currency, keep the exchange rate visible.</Text>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700">Income: {formatCurrency(monthlyIncome, settings.earningCurrency)}</span>
        <span className="rounded-full bg-teal-50 px-3 py-2 font-medium text-teal-700">1 {settings.earningCurrency} = {activeExchangeRate.toLocaleString()} {settings.spendingCurrency}</span>
        <Button variant="ghost" size="sm" onClick={signOut} type="button">Sign out</Button>
      </div>
    </header>
  );
}
