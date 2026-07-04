import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import type { NetWorthItemFormValues } from "../../component/wealth/networth/AssetLiabilityFormModal";
import type { Asset, Liability } from "../../models/wealth/types";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useNetWorth() {
  const assets = useWealthStore((state) => state.assets);
  const liabilities = useWealthStore((state) => state.liabilities);
  const setAssets = useWealthStore((state) => state.setAssets);
  const setLiabilities = useWealthStore((state) => state.setLiabilities);

  async function createAsset(values: NetWorthItemFormValues): Promise<boolean> {
    try {
      const created: Asset = { id: crypto.randomUUID(), ...values };
      await wealthService.createAsset(created);
      setAssets([...assets, created]);
      Success("Asset added.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save asset.");
      return false;
    }
  }

  async function updateAsset(existing: Asset, values: NetWorthItemFormValues): Promise<boolean> {
    try {
      const updated: Asset = { ...existing, ...values };
      await wealthService.updateAsset(updated);
      setAssets(assets.map((asset) => (asset.id === updated.id ? updated : asset)));
      Success("Asset updated.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save asset.");
      return false;
    }
  }

  async function deleteAsset(asset: Asset): Promise<boolean> {
    try {
      await wealthService.deleteAsset(asset.id);
      setAssets(assets.filter((item) => item.id !== asset.id));
      Success("Asset deleted.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to delete asset.");
      return false;
    }
  }

  async function createLiability(values: NetWorthItemFormValues): Promise<boolean> {
    try {
      const created: Liability = { id: crypto.randomUUID(), ...values };
      await wealthService.createLiability(created);
      setLiabilities([...liabilities, created]);
      Success("Liability added.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save liability.");
      return false;
    }
  }

  async function updateLiability(existing: Liability, values: NetWorthItemFormValues): Promise<boolean> {
    try {
      const updated: Liability = { ...existing, ...values };
      await wealthService.updateLiability(updated);
      setLiabilities(liabilities.map((liability) => (liability.id === updated.id ? updated : liability)));
      Success("Liability updated.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save liability.");
      return false;
    }
  }

  async function deleteLiability(liability: Liability): Promise<boolean> {
    try {
      await wealthService.deleteLiability(liability.id);
      setLiabilities(liabilities.filter((item) => item.id !== liability.id));
      Success("Liability deleted.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to delete liability.");
      return false;
    }
  }

  return { assets, liabilities, createAsset, updateAsset, deleteAsset, createLiability, updateLiability, deleteLiability };
}
