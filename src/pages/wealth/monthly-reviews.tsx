import TextArea from "../../component/input/textarea";
import Text from "../../component/typography/typography";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";

export default function MonthlyReviewsPage() {
  const { monthlyReviews, settings } = useWealthSnapshot();
  const review = monthlyReviews[0];
  return (
    <div className="space-y-5">
      <div>
        <Text size="2xl" className="font-bold text-slate-950">Monthly Reviews</Text>
        <Text size="sm" className="text-slate-500">Compare plan against actual spending and capture notes.</Text>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <Text size="lg" className="font-semibold text-slate-950">{review.month}</Text>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><Text size="xs" className="text-slate-500">Planned Spend</Text><Text size="xl" className="font-bold">{formatCurrency(review.plannedSpend, settings.spendingCurrency)}</Text></div>
          <div className="rounded-xl bg-slate-50 p-4"><Text size="xs" className="text-slate-500">Actual Spend</Text><Text size="xl" className="font-bold">{formatCurrency(review.actualSpend, settings.spendingCurrency)}</Text></div>
          <div className="rounded-xl bg-slate-50 p-4"><Text size="xs" className="text-slate-500">Savings</Text><Text size="xl" className="font-bold">{formatCurrency(review.savings, settings.spendingCurrency)}</Text></div>
        </div>
        <div className="mt-5">
          <TextArea label="Review Notes" name="notes" value={review.notes} readOnly notrequired />
        </div>
      </section>
    </div>
  );
}
