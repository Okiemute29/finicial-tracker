import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../buttons/button";
import { currencyOptions } from "../../../constants/currencies";
import AuthGeneralInput from "../../input/authinput";
import Select from "../../input/select";
import Modal from "../../modal/modal";
import type { Asset, Liability } from "../../../models/wealth/types";

const netWorthItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  value: z.number().positive("Value must be greater than 0."),
  currency: z.string().min(1, "Currency is required."),
});

export type NetWorthItemFormValues = z.infer<typeof netWorthItemSchema>;

const emptyValues: NetWorthItemFormValues = { name: "", value: 0, currency: "USD" };

type AssetLiabilityFormModalProps = {
  kind: "asset" | "liability";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: NetWorthItemFormValues) => void | Promise<void>;
  initialValue?: Asset | Liability;
  submitting?: boolean;
};

export default function AssetLiabilityFormModal({ kind, isOpen, onClose, onSubmit, initialValue, submitting }: AssetLiabilityFormModalProps) {
  const label = kind === "asset" ? "asset" : "liability";
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NetWorthItemFormValues>({
    resolver: zodResolver(netWorthItemSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(initialValue ? { name: initialValue.name, value: initialValue.value, currency: initialValue.currency } : emptyValues);
  }, [isOpen, initialValue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? `Edit ${label}` : `New ${label}`} size="sm">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthGeneralInput label="Name" error={errors.name?.message} {...register("name")} />
        <div className="grid grid-cols-2 gap-4">
          <AuthGeneralInput label="Value" type="number" step="0.01" error={errors.value?.message} {...register("value", { valueAsNumber: true })} />
          <Select label="Currency" options={currencyOptions} error={errors.currency?.message} {...register("currency")} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{initialValue ? "Save changes" : `Add ${label}`}</Button>
        </div>
      </form>
    </Modal>
  );
}
