import Text from "../typography/typography";

const variants: Record<string, string> = {
  active: "bg-green-600/10 text-green-700 dark:text-green-400",
  completed: "bg-green-600/10 text-green-700 dark:text-green-400",
  paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  income: "bg-blue-600/10 text-blue-700 dark:text-blue-400",
  expense: "bg-red-600/10 text-red-700 dark:text-red-400",
  balanced: "bg-green-600/10 text-green-700 dark:text-green-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  critical: "bg-red-600/10 text-red-700 dark:text-red-400",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  medium: "bg-blue-600/10 text-blue-700 dark:text-blue-400",
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  default: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export default function StatusBadge({ label, variant }: { label: string; variant?: string }) {
  const badgeVariant = variant ?? label.toLowerCase();
  return <Text size="xs" className={`w-fit rounded-full px-3 py-1 font-medium ${variants[badgeVariant] ?? variants.default}`}>{label}</Text>;
}
