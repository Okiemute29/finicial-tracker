import { useEffect } from "react";
import { exchangeRateService } from "../../services/exchangeRate/exchangeRate.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useLiveExchangeRate() {
  const status = useWealthStore((state) => state.status);
  const earningCurrency = useWealthStore((state) => state.settings.earningCurrency);
  const spendingCurrency = useWealthStore((state) => state.settings.spendingCurrency);
  const manualExchangeRateEnabled = useWealthStore((state) => state.settings.manualExchangeRateEnabled);

  useEffect(() => {
    if (status !== "loaded") return;
    if (manualExchangeRateEnabled) return;
    if (earningCurrency === spendingCurrency) return;

    let active = true;

    exchangeRateService
      .fetchLiveRate(earningCurrency, spendingCurrency)
      .then((rate) => {
        if (!active) return;
        const { settings, setSettings } = useWealthStore.getState();
        setSettings({ ...settings, cachedExchangeRate: rate });
      })
      .catch(() => {
        // Live fetch failed; the existing cachedExchangeRate remains the fallback.
      });

    return () => {
      active = false;
    };
  }, [status, earningCurrency, spendingCurrency, manualExchangeRateEnabled]);
}
