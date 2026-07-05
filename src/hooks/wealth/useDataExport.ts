import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import { wealthService } from "../../services/wealth/wealth.service";

export function useDataExport() {
  async function exportData(): Promise<boolean> {
    try {
      const data = await wealthService.exportAllUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wealth-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      Success("Data exported.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to export data.");
      return false;
    }
  }

  return { exportData };
}
