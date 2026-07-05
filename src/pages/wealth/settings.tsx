import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../component/buttons/button";
import Icon from "../../component/icon/icons";
import AuthGeneralInput from "../../component/input/authinput";
import Select from "../../component/input/select";
import Toggle from "../../component/input/toggle";
import TabNavigation from "../../component/tabs/tab.navigation";
import Text from "../../component/typography/typography";
import IncomeSourceFormModal from "../../component/wealth/settings/IncomeSourceFormModal";
import type { IncomeSourceFormValues } from "../../component/wealth/settings/IncomeSourceFormModal";
import { currencyOptions } from "../../constants/currencies";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { useDangerZone } from "../../hooks/wealth/useDangerZone";
import { useDataExport } from "../../hooks/wealth/useDataExport";
import { useFinancialSettings } from "../../hooks/wealth/useFinancialSettings";
import type { FinancialSettings, IncomeSource } from "../../models/wealth/types";

const settingsSchema = z.object({
  fullName: z.string(),
  earningCurrency: z.string().min(1, "Earning currency is required."),
  spendingCurrency: z.string().min(1, "Spending currency is required."),
  manualExchangeRateEnabled: z.boolean(),
  manualExchangeRate: z.number().min(0, "Manual exchange rate can't be negative."),
  cachedExchangeRate: z.number().positive("Cached exchange rate must be greater than 0."),
  monthlyLivingExpenses: z.number().positive("Monthly living expenses must be greater than 0."),
  emergencyFundMonths: z.number().positive("Emergency fund months must be greater than 0."),
  emailAlertsEnabled: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function toFormValues(settings: FinancialSettings): SettingsFormValues {
  return {
    fullName: settings.fullName ?? "",
    earningCurrency: settings.earningCurrency,
    spendingCurrency: settings.spendingCurrency,
    manualExchangeRateEnabled: settings.manualExchangeRateEnabled,
    manualExchangeRate: settings.manualExchangeRate ?? 0,
    cachedExchangeRate: settings.cachedExchangeRate,
    monthlyLivingExpenses: settings.monthlyLivingExpenses,
    emergencyFundMonths: settings.emergencyFundMonths,
    emailAlertsEnabled: settings.emailAlertsEnabled,
    theme: settings.theme,
  };
}

const tabs = [
  { id: "general", label: "General", icon: "user" },
  { id: "currencies", label: "Currencies", icon: "money" },
  { id: "exchangeRate", label: "Exchange Rate", icon: "trend" },
  { id: "incomeSources", label: "Income Sources", icon: "receipt" },
  { id: "goals", label: "Goals", icon: "goal" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "theme", label: "Theme", icon: "moon" },
  { id: "export", label: "Export Data", icon: "download" },
  { id: "danger", label: "Danger Zone", icon: "alertTriangle" },
];

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function WealthSettingsPage() {
  const { settings, saveSettings, addIncomeSource, updateIncomeSource, removeIncomeSource } = useFinancialSettings();
  const { exportData } = useDataExport();
  const { deleteAllData } = useDangerZone();

  const [activeTab, setActiveTab] = useState("general");
  const [savingSettings, setSavingSettings] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState<IncomeSource | undefined>(undefined);
  const [submittingIncome, setSubmittingIncome] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toFormValues(settings),
  });

  useEffect(() => {
    reset(toFormValues(settings));
  }, [settings, reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSavingSettings(true);
    await saveSettings({ ...settings, ...values, fullName: values.fullName.trim() === "" ? null : values.fullName.trim() });
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

  async function handleExport() {
    setExporting(true);
    await exportData();
    setExporting(false);
  }

  async function handleDeleteAll() {
    setDeleting(true);
    const success = await deleteAllData();
    setDeleting(false);
    if (success) setConfirmDeleteText("");
  }

  const isSettingsForm = ["general", "currencies", "exchangeRate", "goals", "notifications", "theme"].includes(activeTab);

  return (
    <div className="space-y-5">
      <div>
        <Text size="2xl" className="font-bold text-slate-950 dark:text-white">Settings</Text>
        <Text size="sm" className="text-slate-500 dark:text-slate-400">Manage your account, currencies, goals, and data.</Text>
      </div>

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {isSettingsForm ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            {activeTab === "general" ? (
              <div className="space-y-4">
                <AuthGeneralInput label="Full Name" notrequired description="Used for greetings on the dashboard." error={errors.fullName?.message} {...register("fullName")} />
              </div>
            ) : null}

            {activeTab === "currencies" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select label="Earning Currency" options={currencyOptions} error={errors.earningCurrency?.message} {...register("earningCurrency")} />
                <Select label="Spending Currency" options={currencyOptions} error={errors.spendingCurrency?.message} {...register("spendingCurrency")} />
              </div>
            ) : null}

            {activeTab === "exchangeRate" ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <div>
                    <Text size="sm" className="font-semibold text-slate-900 dark:text-white">Manual exchange-rate override</Text>
                    <Text size="xs" className="text-slate-500 dark:text-slate-400">When enabled, all conversions use the manual value above.</Text>
                  </div>
                  <Controller control={control} name="manualExchangeRateEnabled" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />} />
                </div>
              </>
            ) : null}

            {activeTab === "goals" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AuthGeneralInput
                  label="Monthly Living Expenses"
                  type="number"
                  step="0.01"
                  description="Used to calculate your Emergency Fund target."
                  error={errors.monthlyLivingExpenses?.message}
                  {...register("monthlyLivingExpenses", { valueAsNumber: true })}
                />
                <AuthGeneralInput
                  label="Emergency Fund Months"
                  type="number"
                  step="1"
                  description="Target = monthly living expenses × this many months."
                  error={errors.emergencyFundMonths?.message}
                  {...register("emergencyFundMonths", { valueAsNumber: true })}
                />
              </div>
            ) : null}

            {activeTab === "notifications" ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <div>
                  <Text size="sm" className="font-semibold text-slate-900 dark:text-white">Overspending email alerts</Text>
                  <Text size="xs" className="text-slate-500 dark:text-slate-400">
                    In-app warnings are always on. Email alerts require a scheduled server job that isn&apos;t deployed yet — this toggle just saves your preference for when it is.
                  </Text>
                </div>
                <Controller control={control} name="emailAlertsEnabled" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />} />
              </div>
            ) : null}

            {activeTab === "theme" ? (
              <Select label="Theme" options={themeOptions} description="System follows your device's light/dark setting." error={errors.theme?.message} {...register("theme")} />
            ) : null}

            <div className="mt-5 flex justify-end gap-3">
              {isDirty ? <Button variant="ghost" size="sm" type="button" onClick={() => reset()}>Reset</Button> : null}
              <Button type="submit" loading={savingSettings} disabled={!isDirty}>Save Changes</Button>
            </div>
          </section>
        </form>
      ) : null}

      {activeTab === "incomeSources" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Income Sources</Text>
            <Button variant="outline" size="sm" leftIcon="plus" onClick={openCreateIncomeSource} type="button">Add income source</Button>
          </div>
          <div className="space-y-3">
            {settings.incomeSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <Text size="sm" className="font-semibold text-slate-900 dark:text-white">{source.label}</Text>
                  <Text size="xs" className="text-slate-500 dark:text-slate-400">{formatCurrency(source.amount, source.currency)} · {source.cadence}</Text>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => openEditIncomeSource(source)} className="text-slate-400 transition hover:text-teal-700 dark:text-slate-500 dark:hover:text-teal-400" aria-label={`Edit ${source.label}`}>
                    <Icon name="edit" iconClass="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDeleteIncomeSource(source)} className="text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400" aria-label={`Remove ${source.label}`}>
                    <Icon name="trash" iconClass="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {settings.incomeSources.length === 0 ? <Text size="sm" className="text-slate-500 dark:text-slate-400">No income sources yet.</Text> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "export" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Export Data</Text>
          <Text size="sm" className="mt-1 text-slate-500 dark:text-slate-400">
            Download every record tied to your account — settings, income sources, budget categories, goals, transactions, assets, liabilities, monthly reviews, goal allocations, and net worth
            snapshots — as one JSON file.
          </Text>
          <Button className="mt-4" onClick={handleExport} loading={exporting} leftIcon="download" type="button">Download JSON</Button>
        </section>
      ) : null}

      {activeTab === "danger" ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
          <Text size="lg" className="font-semibold text-red-900 dark:text-red-300">Danger Zone</Text>
          <Text size="sm" className="mt-1 text-red-700 dark:text-red-400">
            This permanently deletes every budget category, goal, transaction, asset, liability, monthly review, and net worth snapshot in your account. Your login and currency/exchange-rate
            settings are kept. This can&apos;t be undone.
          </Text>
          <Text size="xs" className="mt-1 text-red-700 dark:text-red-400">
            Full account deletion (removing your login itself) isn&apos;t available yet — it needs a server-side function we haven&apos;t built.
          </Text>
          <div className="mt-4 max-w-sm space-y-3">
            <AuthGeneralInput
              label={'Type "DELETE" to confirm'}
              value={confirmDeleteText}
              onChange={(event) => setConfirmDeleteText(event.target.value)}
              notrequired
            />
            <Button variant="danger" onClick={handleDeleteAll} loading={deleting} disabled={confirmDeleteText !== "DELETE"} type="button">
              Delete all my data
            </Button>
          </div>
        </section>
      ) : null}

      <IncomeSourceFormModal isOpen={incomeModalOpen} onClose={() => setIncomeModalOpen(false)} onSubmit={handleIncomeSubmit} initialValue={editingIncomeSource} submitting={submittingIncome} />
    </div>
  );
}
