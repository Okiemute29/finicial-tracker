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
import { formatCurrency } from "../../helpers/currencyHelpers";
import { calculateReviewSavingsRate, generateReviewSummary, summarizeMonthlyTransactions } from "../../helpers/wealthCalculations";
import { useMonthlyReviews } from "../../hooks/wealth/useMonthlyReviews";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import type { MonthlyReview } from "../../models/wealth/types";

const reviewSchema = z.object({
  plannedSpend: z.number().min(0, "Planned spend can't be negative."),
  actualSpend: z.number().min(0, "Actual spend can't be negative."),
  savings: z.number().min(0, "Savings can't be negative."),
  notes: z.string(),
  whatWentWell: z.string(),
  whatCouldImprove: z.string(),
  biggestWin: z.string(),
  lessonsLearned: z.string(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const emptyReflection = { notes: "", whatWentWell: "", whatCouldImprove: "", biggestWin: "", lessonsLearned: "" };

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
  const { settings, transactions, monthlyIncome, activeExchangeRate, netWorth } = useWealthSnapshot();
  const { monthlyReviews, saveMonthlyReview } = useMonthlyReviews();
  const [selectedMonth, setSelectedMonth] = useState(() => monthlyReviews[0]?.month ?? currentMonth());
  const [submitting, setSubmitting] = useState(false);
  const [autoSummary, setAutoSummary] = useState("");

  const existingReview = useMemo(() => monthlyReviews.find((review) => review.month === selectedMonth), [monthlyReviews, selectedMonth]);

  function computeAutoDefaults(month: string): ReviewFormValues {
    const plannedSpend = monthlyIncome * activeExchangeRate;
    const { expenses: actualSpend } = summarizeMonthlyTransactions(transactions, month);
    return { plannedSpend, actualSpend, savings: Math.max(0, plannedSpend - actualSpend), ...emptyReflection };
  }

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: computeAutoDefaults(selectedMonth),
  });

  const watchedSavings = watch("savings");
  const watchedPlannedSpend = watch("plannedSpend");

  useEffect(() => {
    const freshSummary = generateReviewSummary(transactions, selectedMonth, settings.spendingCurrency);

    if (existingReview) {
      reset({
        plannedSpend: existingReview.plannedSpend,
        actualSpend: existingReview.actualSpend,
        savings: existingReview.savings,
        notes: existingReview.notes,
        whatWentWell: existingReview.whatWentWell ?? "",
        whatCouldImprove: existingReview.whatCouldImprove ?? "",
        biggestWin: existingReview.biggestWin ?? "",
        lessonsLearned: existingReview.lessonsLearned ?? "",
      });
      setAutoSummary(existingReview.autoSummary || freshSummary);
      return;
    }

    const plannedSpend = monthlyIncome * activeExchangeRate;
    const { expenses: actualSpend } = summarizeMonthlyTransactions(transactions, selectedMonth);
    reset({ plannedSpend, actualSpend, savings: Math.max(0, plannedSpend - actualSpend), ...emptyReflection });
    setAutoSummary(freshSummary);
  }, [existingReview, selectedMonth, monthlyIncome, activeExchangeRate, transactions, settings.spendingCurrency, reset]);

  function handleRecalculate() {
    const defaults = computeAutoDefaults(selectedMonth);
    setValue("plannedSpend", defaults.plannedSpend);
    setValue("actualSpend", defaults.actualSpend);
    setValue("savings", defaults.savings);
    setAutoSummary(generateReviewSummary(transactions, selectedMonth, settings.spendingCurrency));
  }

  async function onSubmit(values: ReviewFormValues) {
    setSubmitting(true);
    const review: MonthlyReview = {
      id: existingReview?.id ?? crypto.randomUUID(),
      month: selectedMonth,
      ...values,
      savingsRate: calculateReviewSavingsRate(values.savings, values.plannedSpend),
      netWorthSnapshot: netWorth.netWorth,
      autoSummary,
    };
    await saveMonthlyReview(review);
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text size="2xl" className="font-bold text-slate-950 dark:text-white">Monthly Reviews</Text>
          <Text size="sm" className="text-slate-500 dark:text-slate-400">Compare plan against actual spending and capture notes.</Text>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSelectedMonth((month) => shiftMonth(month, -1))} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Previous month">
            <Icon name="arrowLeft" iconClass="h-4 w-4" />
          </button>
          <Text size="sm" className="min-w-32 text-center font-semibold text-slate-900 dark:text-white">{formatMonthLabel(selectedMonth)}</Text>
          <button type="button" onClick={() => setSelectedMonth((month) => shiftMonth(month, 1))} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Next month">
            <Icon name="arrowRight" iconClass="h-4 w-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
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

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <Text size="xs" className="text-slate-500 dark:text-slate-400">Savings Rate</Text>
              <Text size="lg" className="font-bold text-slate-900 dark:text-white">{calculateReviewSavingsRate(watchedSavings, watchedPlannedSpend)}%</Text>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <Text size="xs" className="text-slate-500 dark:text-slate-400">Net Worth (current snapshot)</Text>
              <Text size="lg" className="font-bold text-slate-900 dark:text-white">{formatCurrency(netWorth.netWorth, settings.earningCurrency)}</Text>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <Text size="xs" className="font-semibold text-slate-700 dark:text-slate-300">Auto-generated summary</Text>
            <Text size="sm" className="mt-1 text-slate-600 dark:text-slate-300">{autoSummary}</Text>
          </div>

          <div className="mt-5">
            <TextArea label="Review Notes" notrequired error={errors.notes?.message} {...register("notes")} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Reflection</Text>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextArea label="What went well" notrequired {...register("whatWentWell")} />
            <TextArea label="What could improve" notrequired {...register("whatCouldImprove")} />
            <TextArea label="Biggest financial win" notrequired {...register("biggestWin")} />
            <TextArea label="Lessons learned" notrequired {...register("lessonsLearned")} />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" loading={submitting}>{existingReview ? "Save changes" : "Create review"}</Button>
        </div>
      </form>
    </div>
  );
}
