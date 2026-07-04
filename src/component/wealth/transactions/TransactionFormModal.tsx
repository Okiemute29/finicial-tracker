import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../buttons/button";
import AuthGeneralInput from "../../input/authinput";
import Select from "../../input/select";
import Modal from "../../modal/modal";
import type { BudgetCategory, Transaction } from "../../../models/wealth/types";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  amount: z.number().positive("Amount must be greater than 0."),
  currency: z.string().min(1, "Currency is required."),
  date: z.string().min(1, "Date is required."),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

const typeOptions = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

type TransactionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
  initialValue?: Transaction;
  submitting?: boolean;
  budgetCategories: BudgetCategory[];
  currencyOptions: { label: string; value: string }[];
  defaultCurrency: string;
};

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue,
  submitting,
  budgetCategories,
  currencyOptions,
  defaultCurrency,
}: TransactionFormModalProps) {
  const categoryOptions = [{ label: "No category", value: "" }, ...budgetCategories.map((category) => ({ label: category.name, value: category.id }))];
  const emptyValues: TransactionFormValues = {
    type: "expense",
    categoryId: "",
    description: "",
    amount: 0,
    currency: defaultCurrency,
    date: new Date().toISOString().slice(0, 10),
  };

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialValue) {
      reset({
        type: initialValue.type,
        categoryId: initialValue.categoryId ?? "",
        description: initialValue.description,
        amount: initialValue.amount,
        currency: initialValue.currency,
        date: initialValue.date,
      });
    } else {
      reset({ type: "expense", categoryId: "", description: "", amount: 0, currency: defaultCurrency, date: new Date().toISOString().slice(0, 10) });
    }
  }, [isOpen, initialValue, reset, defaultCurrency]);

  const type = watch("type");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? "Edit transaction" : "New transaction"} size="sm">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Select label="Type" options={typeOptions} error={errors.type?.message} {...register("type")} />
        {type === "expense" ? (
          <Select label="Category" options={categoryOptions} notrequired error={errors.categoryId?.message} {...register("categoryId")} />
        ) : null}
        <AuthGeneralInput label="Description" error={errors.description?.message} {...register("description")} />
        <div className="grid grid-cols-2 gap-4">
          <AuthGeneralInput label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
          <Select label="Currency" options={currencyOptions} error={errors.currency?.message} {...register("currency")} />
        </div>
        <AuthGeneralInput label="Date" type="date" error={errors.date?.message} {...register("date")} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{initialValue ? "Save changes" : "Add transaction"}</Button>
        </div>
      </form>
    </Modal>
  );
}
