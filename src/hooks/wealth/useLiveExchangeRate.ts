import { useEffect } from "react";
import { exchangeRateService } from "../../services/exchangeRate/exchangeRate.service";
import { wealthService } from "../../services/wealth/wealth.service";
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

        wealthService.updateCachedExchangeRate(rate).catch(() => {
          // Best-effort persistence; the in-memory rate is already applied.
        });
        wealthService
          .recordExchangeRateSnapshot({ baseCurrency: earningCurrency, quoteCurrency: spendingCurrency, rate, source: "api" })
          .catch(() => {
            // Best-effort logging; missing a snapshot doesn't affect current behavior.
          });
      })
      .catch(() => {
        // Live fetch failed; the existing cachedExchangeRate remains the fallback.
      });

    return () => {
      active = false;
    };
  }, [status, earningCurrency, spendingCurrency, manualExchangeRateEnabled]);
}
