import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../buttons/button";
import { currencyOptions } from "../../../constants/currencies";
import AuthGeneralInput from "../../input/authinput";
import Select from "../../input/select";
import Modal from "../../modal/modal";
import type { IncomeSource } from "../../../models/wealth/types";

const incomeSourceSchema = z.object({
  label: z.string().min(1, "Label is required."),
  amount: z.number().positive("Amount must be greater than 0."),
  currency: z.string().min(1, "Currency is required."),
  cadence: z.enum(["monthly", "weekly", "annual", "one_time"]),
});

export type IncomeSourceFormValues = z.infer<typeof incomeSourceSchema>;

const cadenceOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Annual", value: "annual" },
  { label: "One-time", value: "one_time" },
];

const emptyValues: IncomeSourceFormValues = { label: "", amount: 0, currency: "USD", cadence: "monthly" };

type IncomeSourceFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: IncomeSourceFormValues) => void | Promise<void>;
  initialValue?: IncomeSource;
  submitting?: boolean;
};

export default function IncomeSourceFormModal({ isOpen, onClose, onSubmit, initialValue, submitting }: IncomeSourceFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncomeSourceFormValues>({
    resolver: zodResolver(incomeSourceSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(initialValue ? { label: initialValue.label, amount: initialValue.amount, currency: initialValue.currency, cadence: initialValue.cadence } : emptyValues);
  }, [isOpen, initialValue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? "Edit income source" : "New income source"} size="sm">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthGeneralInput label="Label" error={errors.label?.message} {...register("label")} />
        <div className="grid grid-cols-2 gap-4">
          <AuthGeneralInput label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
          <Select label="Currency" options={currencyOptions} error={errors.currency?.message} {...register("currency")} />
        </div>
        <Select label="Cadence" options={cadenceOptions} error={errors.cadence?.message} {...register("cadence")} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{initialValue ? "Save changes" : "Add income source"}</Button>
        </div>
      </form>
    </Modal>
  );
}
