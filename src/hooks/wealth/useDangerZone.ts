import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useDangerZone() {
  async function deleteAllData(): Promise<boolean> {
    try {
      await wealthService.deleteAllUserData();
      await useWealthStore.getState().loadWealthData();
      Success("All your data has been deleted.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to delete your data.");
      return false;
    }
  }

  return { deleteAllData };
}
