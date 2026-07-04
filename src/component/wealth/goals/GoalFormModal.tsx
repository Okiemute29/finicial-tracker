import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../buttons/button";
import { currencyOptions } from "../../../constants/currencies";
import AuthGeneralInput from "../../input/authinput";
import Select from "../../input/select";
import Modal from "../../modal/modal";
import type { Goal } from "../../../models/wealth/types";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required."),
  targetAmount: z.number().positive("Target amount must be greater than 0."),
  currentAmount: z.number().min(0, "Current amount can't be negative."),
  currency: z.string().min(1, "Currency is required."),
  status: z.enum(["active", "completed", "paused"]),
  dueDate: z.string().optional(),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Paused", value: "paused" },
];

const emptyValues: GoalFormValues = {
  name: "",
  targetAmount: 0,
  currentAmount: 0,
  currency: "USD",
  status: "active",
  dueDate: "",
};

type GoalFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void | Promise<void>;
  initialValue?: Goal;
  submitting?: boolean;
};

export default function GoalFormModal({ isOpen, onClose, onSubmit, initialValue, submitting }: GoalFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      initialValue
        ? {
            name: initialValue.name,
            targetAmount: initialValue.targetAmount,
            currentAmount: initialValue.currentAmount,
            currency: initialValue.currency,
            status: initialValue.status,
            dueDate: initialValue.dueDate ?? "",
          }
        : emptyValues,
    );
  }, [isOpen, initialValue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? "Edit goal" : "New goal"} size="sm">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthGeneralInput label="Name" error={errors.name?.message} {...register("name")} />
        <div className="grid grid-cols-2 gap-4">
          <AuthGeneralInput label="Target Amount" type="number" step="0.01" error={errors.targetAmount?.message} {...register("targetAmount", { valueAsNumber: true })} />
          <AuthGeneralInput label="Current Amount" type="number" step="0.01" error={errors.currentAmount?.message} {...register("currentAmount", { valueAsNumber: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Currency" options={currencyOptions} error={errors.currency?.message} {...register("currency")} />
          <Select label="Status" options={statusOptions} error={errors.status?.message} {...register("status")} />
        </div>
        <AuthGeneralInput label="Due Date" type="date" notrequired error={errors.dueDate?.message} {...register("dueDate")} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{initialValue ? "Save changes" : "Create goal"}</Button>
        </div>
      </form>
    </Modal>
  );
}
