import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../buttons/button";
import { currencyOptions } from "../../../constants/currencies";
import { formatCurrency } from "../../../helpers/currencyHelpers";
import { resolveGoalTargetAmount } from "../../../helpers/wealthCalculations";
import AuthGeneralInput from "../../input/authinput";
import Select from "../../input/select";
import TextArea from "../../input/textarea";
import Toggle from "../../input/toggle";
import Modal from "../../modal/modal";
import type { FinancialSettings, Goal } from "../../../models/wealth/types";

const goalSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    description: z.string(),
    category: z.enum(["rent", "emergency", "wedding", "investment", "business", "custom"]),
    priority: z.enum(["critical", "high", "medium", "low"]),
    contributionPercentage: z.number().min(0, "Contribution can't be negative.").max(100, "Contribution can't exceed 100%."),
    targetAmount: z.number().min(0),
    currentAmount: z.number().min(0, "Current amount can't be negative."),
    currency: z.string().min(1, "Currency is required."),
    status: z.enum(["active", "completed", "paused"]),
    targetType: z.enum(["fixed", "ongoing"]),
    isAutoFunded: z.boolean(),
    dueDate: z.string().optional(),
  })
  .refine((values) => values.targetType === "ongoing" || values.targetAmount > 0, {
    message: "Target amount must be greater than 0 for a fixed goal.",
    path: ["targetAmount"],
  });

export type GoalFormValues = z.infer<typeof goalSchema>;

const categoryOptions = [
  { label: "Rent", value: "rent" },
  { label: "Emergency", value: "emergency" },
  { label: "Wedding", value: "wedding" },
  { label: "Investment", value: "investment" },
  { label: "Business", value: "business" },
  { label: "Custom", value: "custom" },
];

const priorityOptions = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const targetTypeOptions = [
  { label: "Fixed target", value: "fixed" },
  { label: "Ongoing (no fixed target)", value: "ongoing" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Paused", value: "paused" },
];

const emptyValues: GoalFormValues = {
  name: "",
  description: "",
  category: "custom",
  priority: "medium",
  contributionPercentage: 0,
  targetAmount: 0,
  currentAmount: 0,
  currency: "USD",
  status: "active",
  targetType: "fixed",
  isAutoFunded: false,
  dueDate: "",
};

type GoalFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void | Promise<void>;
  initialValue?: Goal;
  submitting?: boolean;
  settings: Pick<FinancialSettings, "spendingCurrency" | "monthlyLivingExpenses" | "emergencyFundMonths">;
};

export default function GoalFormModal({ isOpen, onClose, onSubmit, initialValue, submitting, settings }: GoalFormModalProps) {
  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      initialValue
        ? {
            name: initialValue.name,
            description: initialValue.description,
            category: initialValue.category,
            priority: initialValue.priority,
            contributionPercentage: initialValue.contributionPercentage,
            targetAmount: initialValue.targetAmount,
            currentAmount: initialValue.currentAmount,
            currency: initialValue.currency,
            status: initialValue.status,
            targetType: initialValue.targetType,
            isAutoFunded: initialValue.isAutoFunded,
            dueDate: initialValue.dueDate ?? "",
          }
        : { ...emptyValues, currency: settings.spendingCurrency },
    );
  }, [isOpen, initialValue, reset, settings.spendingCurrency]);

  const category = watch("category");
  const targetType = watch("targetType");
  const isAutoFunded = watch("isAutoFunded");
  const isEmergencyGoal = category === "emergency";
  const resolvedEmergencyTarget = resolveGoalTargetAmount({ category: "emergency", targetAmount: 0 }, settings);

  useEffect(() => {
    if (isEmergencyGoal) setValue("targetAmount", resolvedEmergencyTarget);
  }, [isEmergencyGoal, resolvedEmergencyTarget, setValue]);

  useEffect(() => {
    if (isAutoFunded) setValue("currency", settings.spendingCurrency);
  }, [isAutoFunded, settings.spendingCurrency, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? "Edit goal" : "New goal"} size="md">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthGeneralInput label="Name" error={errors.name?.message} {...register("name")} />
        <TextArea label="Description" notrequired error={errors.description?.message} {...register("description")} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" options={categoryOptions} error={errors.category?.message} {...register("category")} />
          <Select label="Priority" options={priorityOptions} error={errors.priority?.message} {...register("priority")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Target Type" options={targetTypeOptions} error={errors.targetType?.message} {...register("targetType")} />
          <AuthGeneralInput
            label="Contribution %"
            type="number"
            step="0.1"
            description="Share of each income transaction allocated here."
            error={errors.contributionPercentage?.message}
            {...register("contributionPercentage", { valueAsNumber: true })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {targetType === "fixed" ? (
            <AuthGeneralInput
              label="Target Amount"
              type="number"
              step="0.01"
              disabled={isEmergencyGoal}
              description={isEmergencyGoal ? `Auto-calculated: ${formatCurrency(resolvedEmergencyTarget, settings.spendingCurrency)} (monthly living expenses × emergency months)` : undefined}
              error={errors.targetAmount?.message}
              {...register("targetAmount", { valueAsNumber: true })}
            />
          ) : null}
          <AuthGeneralInput label="Current Amount" type="number" step="0.01" error={errors.currentAmount?.message} {...register("currentAmount", { valueAsNumber: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Currency"
            options={currencyOptions}
            disabled={isAutoFunded}
            description={isAutoFunded ? "Locked to your spending currency while auto-funded." : undefined}
            error={errors.currency?.message}
            {...register("currency")}
          />
          <Select label="Status" options={statusOptions} error={errors.status?.message} {...register("status")} />
        </div>
        <AuthGeneralInput label="Due Date" type="date" notrequired error={errors.dueDate?.message} {...register("dueDate")} />
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div>
            <span className="block text-sm font-semibold text-slate-900">Auto-funded from income</span>
            <span className="block text-xs text-slate-500">When on, a share of every income transaction is allocated here automatically.</span>
          </div>
          <Controller control={control} name="isAutoFunded" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{initialValue ? "Save changes" : "Create goal"}</Button>
        </div>
      </form>
    </Modal>
  );
}
