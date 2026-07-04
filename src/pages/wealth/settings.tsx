import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../component/buttons/button";
import Icon from "../../component/icon/icons";
import AuthGeneralInput from "../../component/input/authinput";
import Select from "../../component/input/select";
import Toggle from "../../component/input/toggle";
import Text from "../../component/typography/typography";
import IncomeSourceFormModal from "../../component/wealth/settings/IncomeSourceFormModal";
import type { IncomeSourceFormValues } from "../../component/wealth/settings/IncomeSourceFormModal";
import { currencyOptions } from "../../constants/currencies";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { useFinancialSettings } from "../../hooks/wealth/useFinancialSettings";
import type { IncomeSource } from "../../models/wealth/types";

const settingsSchema = z.object({
  earningCurrency: z.string().min(1, "Earning currency is required."),
  spendingCurrency: z.string().min(1, "Spending currency is required."),
  manualExchangeRateEnabled: z.boolean(),
  manualExchangeRate: z.number().min(0, "Manual exchange rate can't be negative."),
  cachedExchangeRate: z.number().positive("Cached exchange rate must be greater than 0."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function toFormValues(settings: { earningCurrency: string; spendingCurrency: string; manualExchangeRateEnabled: boolean; manualExchangeRate: number | null; cachedExchangeRate: number }): SettingsFormValues {
  return {
    earningCurrency: settings.earningCurrency,
    spendingCurrency: settings.spendingCurrency,
    manualExchangeRateEnabled: settings.manualExchangeRateEnabled,
    manualExchangeRate: settings.manualExchangeRate ?? 0,
    cachedExchangeRate: settings.cachedExchangeRate,
  };
}

export default function WealthSettingsPage() {
  const { settings, saveSettings, addIncomeSource, updateIncomeSource, removeIncomeSource } = useFinancialSettings();
  const [savingSettings, setSavingSettings] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState<IncomeSource | undefined>(undefined);
  const [submittingIncome, setSubmittingIncome] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toFormValues(settings),
  });

  useEffect(() => {
    reset(toFormValues(settings));
  }, [settings, reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSavingSettings(true);
    await saveSettings({ ...settings, ...values });
    setSavingSettings(false);
  }

  function openCreateIncomeSource() {
    setEditingIncomeSource(undefined);
    setIncomeModalOpen(true);
  }

  function openEditIncomeSource(source: IncomeSource) {
    setEditingIncomeSource(source);
    setIncomeModalOpen(true);
  }

  async function handleIncomeSubmit(values: IncomeSourceFormValues) {
    setSubmittingIncome(true);
    const success = editingIncomeSource ? await updateIncomeSource(editingIncomeSource, values) : await addIncomeSource(values);
    setSubmittingIncome(false);
    if (success) setIncomeModalOpen(false);
  }

  async function handleDeleteIncomeSource(source: IncomeSource) {
    if (!window.confirm(`Remove "${source.label}"? This can't be undone.`)) return;
    await removeIncomeSource(source);
  }

  return (
    <div className="space-y-5">
      <div>
        <Text size="2xl" className="font-bold text-slate-950">Settings</Text>
        <Text size="sm" className="text-slate-500">Manage currencies, income sources, and exchange-rate override.</Text>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select label="Earning Currency" options={currencyOptions} error={errors.earningCurrency?.message} {...register("earningCurrency")} />
            <Select label="Spending Currency" options={currencyOptions} error={errors.spendingCurrency?.message} {...register("spendingCurrency")} />
            <AuthGeneralInput
              label="Cached Exchange Rate"
              type="number"
              step="0.0001"
              description="Used when manual override is off and the live fetch fails."
              error={errors.cachedExchangeRate?.message}
              {...register("cachedExchangeRate", { valueAsNumber: true })}
            />
            <AuthGeneralInput
              label="Manual Exchange Rate"
              type="number"
              step="0.0001"
              notrequired
              description="Only used when the override below is on."
              error={errors.manualExchangeRate?.message}
              {...register("manualExchangeRate", { valueAsNumber: true })}
            />
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <Text size="sm" className="font-semibold text-slate-900">Manual exchange-rate override</Text>
              <Text size="xs" className="text-slate-500">When enabled, all conversions use the manual value above.</Text>
            </div>
            <Controller control={control} name="manualExchangeRateEnabled" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />} />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            {isDirty ? <Button variant="ghost" size="sm" type="button" onClick={() => reset()}>Reset</Button> : null}
            <Button type="submit" loading={savingSettings} disabled={!isDirty}>Save Changes</Button>
          </div>
        </section>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Text size="lg" className="font-semibold text-slate-950">Income Sources</Text>
          <Button variant="outline" size="sm" leftIcon="plus" onClick={openCreateIncomeSource} type="button">Add income source</Button>
        </div>
        <div className="space-y-3">
          {settings.incomeSources.map((source) => (
            <div key={source.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div>
                <Text size="sm" className="font-semibold text-slate-900">{source.label}</Text>
                <Text size="xs" className="text-slate-500">{formatCurrency(source.amount, source.currency)} · {source.cadence}</Text>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openEditIncomeSource(source)} className="text-slate-400 transition hover:text-teal-700" aria-label={`Edit ${source.label}`}>
                  <Icon name="edit" iconClass="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDeleteIncomeSource(source)} className="text-slate-400 transition hover:text-red-600" aria-label={`Remove ${source.label}`}>
                  <Icon name="trash" iconClass="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {settings.incomeSources.length === 0 ? <Text size="sm" className="text-slate-500">No income sources yet.</Text> : null}
        </div>
      </section>

      <IncomeSourceFormModal isOpen={incomeModalOpen} onClose={() => setIncomeModalOpen(false)} onSubmit={handleIncomeSubmit} initialValue={editingIncomeSource} submitting={submittingIncome} />
    </div>
  );
}
