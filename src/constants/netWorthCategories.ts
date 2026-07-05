import type { AssetCategory, LiabilityCategory } from "../models/wealth/types";

export type AssetCategoryGroupLabel = "Financial" | "Physical" | "Business" | "Other";

export const assetCategoryGroups: { label: AssetCategoryGroupLabel; options: { label: string; value: AssetCategory }[] }[] = [
  {
    label: "Financial",
    options: [
      { label: "Cash", value: "cash" },
      { label: "Bank Account", value: "bank_account" },
      { label: "Savings", value: "savings" },
      { label: "Investments", value: "investments" },
    ],
  },
  {
    label: "Physical",
    options: [
      { label: "Solar System", value: "solar_system" },
      { label: "Laptop", value: "laptop" },
      { label: "Phone", value: "phone" },
      { label: "Car", value: "car" },
      { label: "Property", value: "property" },
    ],
  },
  {
    label: "Business",
    options: [
      { label: "Domains", value: "domains" },
      { label: "Websites", value: "websites" },
      { label: "Equipment", value: "equipment" },
      { label: "Business Cash", value: "business_cash" },
    ],
  },
  {
    label: "Other",
    options: [{ label: "Other", value: "other" }],
  },
];

export const assetCategoryGroupLookup: Record<AssetCategory, AssetCategoryGroupLabel> = assetCategoryGroups.reduce(
  (lookup, group) => {
    for (const option of group.options) lookup[option.value] = group.label;
    return lookup;
  },
  {} as Record<AssetCategory, AssetCategoryGroupLabel>,
);

export const liabilityCategoryOptions: { label: string; value: LiabilityCategory }[] = [
  { label: "Personal Loan", value: "personal_loan" },
  { label: "Car Loan", value: "car_loan" },
  { label: "Mortgage", value: "mortgage" },
  { label: "Credit Card Debt", value: "credit_card_debt" },
  { label: "Money Owed", value: "money_owed" },
  { label: "Other Debt", value: "other_debt" },
];
