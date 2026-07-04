import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import StatusBadge from "../../component/badge/statusbadge";
import Button from "../../component/buttons/button";
import Icon from "../../component/icon/icons";
import AuthGeneralInput from "../../component/input/authinput";
import TextArea from "../../component/input/textarea";
import Text from "../../component/typography/typography";
import { summarizeMonthlyTransactions } from "../../helpers/wealthCalculations";
import { useMonthlyReviews } from "../../hooks/wealth/useMonthlyReviews";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import type { MonthlyReview } from "../../models/wealth/types";

const reviewSchema = z.object({
  plannedSpend: z.number().min(0, "Planned spend can't be negative."),
  actualSpend: z.number().min(0, "Actual spend can't be negative."),
  savings: z.number().min(0, "Savings can't be negative."),
  notes: z.string(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MonthlyReviewsPage() {
  const { settings, transactions, monthlyIncome, activeExchangeRate } = useWealthSnapshot();
  const { monthlyReviews, saveMonthlyReview } = useMonthlyReviews();
  const [selectedMonth, setSelectedMonth] = useState(() => monthlyReviews[0]?.month ?? currentMonth());
  const [submitting, setSubmitting] = useState(false);

  const existingReview = useMemo(() => monthlyReviews.find((review) => review.month === selectedMonth), [monthlyReviews, selectedMonth]);

  function computeAutoDefaults(month: string): ReviewFormValues {
    const plannedSpend = monthlyIncome * activeExchangeRate;
    const { expenses: actualSpend } = summarizeMonthlyTransactions(transactions, month);
    return { plannedSpend, actualSpend, savings: Math.max(0, plannedSpend - actualSpend), notes: "" };
  }

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: computeAutoDefaults(selectedMonth),
  });

  useEffect(() => {
    if (existingReview) {
      reset({ plannedSpend: existingReview.plannedSpend, actualSpend: existingReview.actualSpend, savings: existingReview.savings, notes: existingReview.notes });
      return;
    }
    const plannedSpend = monthlyIncome * activeExchangeRate;
    const { expenses: actualSpend } = summarizeMonthlyTransactions(transactions, selectedMonth);
    reset({ plannedSpend, actualSpend, savings: Math.max(0, plannedSpend - actualSpend), notes: "" });
  }, [existingReview, selectedMonth, monthlyIncome, activeExchangeRate, transactions, reset]);

  function handleRecalculate() {
    const defaults = computeAutoDefaults(selectedMonth);
    setValue("plannedSpend", defaults.plannedSpend);
    setValue("actualSpend", defaults.actualSpend);
    setValue("savings", defaults.savings);
  }

  async function onSubmit(values: ReviewFormValues) {
    setSubmitting(true);
    const review: MonthlyReview = { id: existingReview?.id ?? crypto.randomUUID(), month: selectedMonth, ...values };
    await saveMonthlyReview(review);
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text size="2xl" className="font-bold text-slate-950">Monthly Reviews</Text>
          <Text size="sm" className="text-slate-500">Compare plan against actual spending and capture notes.</Text>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSelectedMonth((month) => shiftMonth(month, -1))} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Previous month">
            <Icon name="arrowLeft" iconClass="h-4 w-4" />
          </button>
          <Text size="sm" className="min-w-32 text-center font-semibold text-slate-900">{formatMonthLabel(selectedMonth)}</Text>
          <button type="button" onClick={() => setSelectedMonth((month) => shiftMonth(month, 1))} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Next month">
            <Icon name="arrowRight" iconClass="h-4 w-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <StatusBadge
              label={existingReview ? "Saved" : "Auto-calculated from transactions"}
              variant={existingReview ? "balanced" : "default"}
            />
            <Button variant="ghost" size="sm" onClick={handleRecalculate} type="button">Recalculate from transactions</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AuthGeneralInput
              label="Planned Spend"
              type="number"
              step="0.01"
              description={settings.spendingCurrency}
              error={errors.plannedSpend?.message}
              {...register("plannedSpend", { valueAsNumber: true })}
            />
            <AuthGeneralInput
              label="Actual Spend"
              type="number"
              step="0.01"
              description={settings.spendingCurrency}
              error={errors.actualSpend?.message}
              {...register("actualSpend", { valueAsNumber: true })}
            />
            <AuthGeneralInput
              label="Savings"
              type="number"
              step="0.01"
              description={settings.spendingCurrency}
              error={errors.savings?.message}
              {...register("savings", { valueAsNumber: true })}
            />
          </div>
          <div className="mt-5">
            <TextArea label="Review Notes" notrequired error={errors.notes?.message} {...register("notes")} />
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" loading={submitting}>{existingReview ? "Save changes" : "Create review"}</Button>
          </div>
        </section>
      </form>
    </div>
  );
}
