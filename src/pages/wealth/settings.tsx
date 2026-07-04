import AuthGeneralInput from "../../component/input/authinput";
import Select from "../../component/input/select";
import Toggle from "../../component/input/toggle";
import Text from "../../component/typography/typography";
import { currencyOptions } from "../../constants/currencies";
import { useWealthStore } from "../../stores/wealthStore";

export default function WealthSettingsPage() {
  const settings = useWealthStore((state) => state.settings);
  const setSettings = useWealthStore((state) => state.setSettings);

  return (
    <div className="space-y-5">
      <div>
        <Text size="2xl" className="font-bold text-slate-950">Settings</Text>
        <Text size="sm" className="text-slate-500">Manage currencies, income sources, and exchange-rate override.</Text>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Earning Currency" name="earningCurrency" value={settings.earningCurrency} options={currencyOptions} disabled />
          <Select label="Spending Currency" name="spendingCurrency" value={settings.spendingCurrency} options={currencyOptions} disabled />
          <AuthGeneralInput label="Cached Exchange Rate" name="cachedExchangeRate" type="number" value={settings.cachedExchangeRate} readOnly />
          <AuthGeneralInput label="Manual Exchange Rate" name="manualExchangeRate" type="number" value={settings.manualExchangeRate ?? ""} placeholder="Optional override" readOnly notrequired />
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div>
            <Text size="sm" className="font-semibold text-slate-900">Manual exchange-rate override</Text>
            <Text size="xs" className="text-slate-500">When enabled, all conversions use the manual value.</Text>
          </div>
          <Toggle checked={settings.manualExchangeRateEnabled} onChange={(checked) => setSettings({ ...settings, manualExchangeRateEnabled: checked })} />
        </div>
      </section>
    </div>
  );
}
