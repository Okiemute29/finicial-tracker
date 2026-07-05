import { useState } from "react";
import Button from "../../component/buttons/button";
import DataTable from "../../component/table/data.table";
import Icon from "../../component/icon/icons";
import MetricCard from "../../component/wealth/dashboard/MetricCard";
import Text from "../../component/typography/typography";
import AssetLiabilityFormModal from "../../component/wealth/networth/AssetLiabilityFormModal";
import type { NetWorthItemFormValues } from "../../component/wealth/networth/AssetLiabilityFormModal";
import { liabilityCategoryOptions } from "../../constants/netWorthCategories";
import { formatCurrency } from "../../helpers/currencyHelpers";
import { groupAssetsByCategory } from "../../helpers/wealthCalculations";
import { useNetWorth } from "../../hooks/wealth/useNetWorth";
import { useWealthSnapshot } from "../../hooks/wealth/useWealthSnapshot";
import type { Asset, Liability } from "../../models/wealth/types";

const liabilityCategoryLabels = Object.fromEntries(liabilityCategoryOptions.map((option) => [option.value, option.label]));

type AssetGroupTableProps = {
  title: string;
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

function AssetGroupTable({ title, assets, onEdit, onDelete }: AssetGroupTableProps) {
  return (
    <div>
      <Text size="sm" className="mb-2 font-semibold text-slate-700 dark:text-slate-300">{title}</Text>
      {assets.length === 0 ? (
        <Text size="xs" className="text-slate-500 dark:text-slate-400">No {title.toLowerCase()} assets yet.</Text>
      ) : (
        <DataTable
          columns={[{ header: "Asset" }, { header: "Value" }, { header: "" }]}
          data={assets}
          renderRow={(asset) => (
            <>
              <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium dark:border-slate-700 dark:text-white">{asset.name}</td>
              <td className="border-y border-slate-200 px-4 py-4 dark:border-slate-700 dark:text-slate-300">{formatCurrency(asset.value, asset.currency)}</td>
              <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4 dark:border-slate-700">
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => onEdit(asset)} className="text-slate-400 transition hover:text-teal-700 dark:text-slate-500 dark:hover:text-teal-400" aria-label={`Edit ${asset.name}`}>
                    <Icon name="edit" iconClass="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(asset)} className="text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400" aria-label={`Delete ${asset.name}`}>
                    <Icon name="trash" iconClass="h-4 w-4" />
                  </button>
                </div>
              </td>
            </>
          )}
        />
      )}
    </div>
  );
}

export default function NetWorthPage() {
  const { netWorth, settings } = useWealthSnapshot();
  const { assets, liabilities, createAsset, updateAsset, deleteAsset, createLiability, updateLiability, deleteLiability } = useNetWorth();

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);
  const [liabilityModalOpen, setLiabilityModalOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const groupedAssets = groupAssetsByCategory(assets);

  function openCreateAsset() {
    setEditingAsset(undefined);
    setAssetModalOpen(true);
  }

  function openEditAsset(asset: Asset) {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  }

  function openCreateLiability() {
    setEditingLiability(undefined);
    setLiabilityModalOpen(true);
  }

  function openEditLiability(liability: Liability) {
    setEditingLiability(liability);
    setLiabilityModalOpen(true);
  }

  async function handleAssetSubmit(values: NetWorthItemFormValues) {
    setSubmitting(true);
    const success = editingAsset ? await updateAsset(editingAsset, values) : await createAsset(values);
    setSubmitting(false);
    if (success) setAssetModalOpen(false);
  }

  async function handleLiabilitySubmit(values: NetWorthItemFormValues) {
    setSubmitting(true);
    const success = editingLiability ? await updateLiability(editingLiability, values) : await createLiability(values);
    setSubmitting(false);
    if (success) setLiabilityModalOpen(false);
  }

  async function handleDeleteAsset(asset: Asset) {
    if (!window.confirm(`Delete "${asset.name}"? This can't be undone.`)) return;
    await deleteAsset(asset);
  }

  async function handleDeleteLiability(liability: Liability) {
    if (!window.confirm(`Delete "${liability.name}"? This can't be undone.`)) return;
    await deleteLiability(liability);
  }

  return (
    <div className="space-y-6">
      <div>
        <Text size="2xl" className="font-bold text-slate-950 dark:text-white">Net Worth</Text>
        <Text size="sm" className="text-slate-500 dark:text-slate-400">Assets minus liabilities — clothes, food, and rent are expenses, not assets.</Text>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Total Assets" value={formatCurrency(netWorth.totalAssets, settings.earningCurrency)} icon="trend" />
        <MetricCard label="Total Liabilities" value={formatCurrency(netWorth.totalLiabilities, settings.earningCurrency)} icon="transaction" />
        <MetricCard accent label="Net Worth" value={formatCurrency(netWorth.netWorth, settings.earningCurrency)} icon="netWorth" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Assets</Text>
            <Button variant="outline" size="sm" leftIcon="plus" onClick={openCreateAsset} type="button">Add asset</Button>
          </div>
          <div className="space-y-5">
            <AssetGroupTable title="Financial" assets={groupedAssets.financial} onEdit={openEditAsset} onDelete={handleDeleteAsset} />
            <AssetGroupTable title="Physical" assets={groupedAssets.physical} onEdit={openEditAsset} onDelete={handleDeleteAsset} />
            <AssetGroupTable title="Business" assets={groupedAssets.business} onEdit={openEditAsset} onDelete={handleDeleteAsset} />
            {groupedAssets.other.length > 0 ? <AssetGroupTable title="Other" assets={groupedAssets.other} onEdit={openEditAsset} onDelete={handleDeleteAsset} /> : null}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Text size="lg" className="font-semibold text-slate-950 dark:text-white">Liabilities</Text>
            <Button variant="outline" size="sm" leftIcon="plus" onClick={openCreateLiability} type="button">Add liability</Button>
          </div>
          <DataTable
            columns={[{ header: "Liability" }, { header: "Category" }, { header: "Value" }, { header: "" }]}
            data={liabilities}
            renderRow={(liability) => (
              <>
                <td className="rounded-l-lg border-y border-l border-slate-200 px-4 py-4 font-medium dark:border-slate-700 dark:text-white">{liability.name}</td>
                <td className="border-y border-slate-200 px-4 py-4 text-slate-600 dark:border-slate-700 dark:text-slate-300">{liabilityCategoryLabels[liability.category] ?? liability.category}</td>
                <td className="border-y border-slate-200 px-4 py-4 dark:border-slate-700 dark:text-slate-300">{formatCurrency(liability.value, liability.currency)}</td>
                <td className="rounded-r-lg border-y border-r border-slate-200 px-4 py-4 dark:border-slate-700">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => openEditLiability(liability)} className="text-slate-400 transition hover:text-teal-700 dark:text-slate-500 dark:hover:text-teal-400" aria-label={`Edit ${liability.name}`}>
                      <Icon name="edit" iconClass="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDeleteLiability(liability)} className="text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400" aria-label={`Delete ${liability.name}`}>
                      <Icon name="trash" iconClass="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </section>
      </div>

      <AssetLiabilityFormModal kind="asset" isOpen={assetModalOpen} onClose={() => setAssetModalOpen(false)} onSubmit={handleAssetSubmit} initialValue={editingAsset} submitting={submitting} />
      <AssetLiabilityFormModal kind="liability" isOpen={liabilityModalOpen} onClose={() => setLiabilityModalOpen(false)} onSubmit={handleLiabilitySubmit} initialValue={editingLiability} submitting={submitting} />
    </div>
  );
}
