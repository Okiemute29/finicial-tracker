import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import type { IncomeSourceFormValues } from "../../component/wealth/settings/IncomeSourceFormModal";
import type { FinancialSettings, IncomeSource } from "../../models/wealth/types";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useFinancialSettings() {
  const settings = useWealthStore((state) => state.settings);
  const setSettings = useWealthStore((state) => state.setSettings);

  async function saveSettings(next: FinancialSettings): Promise<boolean> {
    try {
      await wealthService.updateFinancialSettings(next);
      setSettings(next);
      Success("Settings saved.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save settings.");
      return false;
    }
  }

  async function addIncomeSource(values: IncomeSourceFormValues): Promise<boolean> {
    try {
      const created: IncomeSource = { id: crypto.randomUUID(), ...values };
      await wealthService.createIncomeSource(created);
      setSettings({ ...settings, incomeSources: [...settings.incomeSources, created] });
      Success("Income source added.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to add income source.");
      return false;
    }
  }

  async function updateIncomeSource(existing: IncomeSource, values: IncomeSourceFormValues): Promise<boolean> {
    try {
      const updated: IncomeSource = { ...existing, ...values };
      await wealthService.updateIncomeSource(updated);
      setSettings({ ...settings, incomeSources: settings.incomeSources.map((item) => (item.id === updated.id ? updated : item)) });
      Success("Income source updated.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to update income source.");
      return false;
    }
  }

  async function removeIncomeSource(source: IncomeSource): Promise<boolean> {
    try {
      await wealthService.deleteIncomeSource(source.id);
      setSettings({ ...settings, incomeSources: settings.incomeSources.filter((item) => item.id !== source.id) });
      Success("Income source removed.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to remove income source.");
      return false;
    }
  }

  return { settings, saveSettings, addIncomeSource, updateIncomeSource, removeIncomeSource };
}
