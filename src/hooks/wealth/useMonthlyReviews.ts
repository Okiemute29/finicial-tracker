import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import type { MonthlyReview } from "../../models/wealth/types";
import { wealthService } from "../../services/wealth/wealth.service";
import { useWealthStore } from "../../stores/wealthStore";

export function useMonthlyReviews() {
  const monthlyReviews = useWealthStore((state) => state.monthlyReviews);
  const setMonthlyReviews = useWealthStore((state) => state.setMonthlyReviews);

  async function saveMonthlyReview(review: MonthlyReview): Promise<boolean> {
    try {
      await wealthService.upsertMonthlyReview(review);
      const exists = monthlyReviews.some((item) => item.id === review.id);
      setMonthlyReviews(exists ? monthlyReviews.map((item) => (item.id === review.id ? review : item)) : [review, ...monthlyReviews]);
      Success("Monthly review saved.");
      return true;
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save monthly review.");
      return false;
    }
  }

  return { monthlyReviews, saveMonthlyReview };
}
