import Text from "../typography/typography";

const variants: Record<string, string> = {
  active: "bg-green-600/10 text-green-700",
  completed: "bg-green-600/10 text-green-700",
  paused: "bg-amber-500/10 text-amber-700",
  income: "bg-blue-600/10 text-blue-700",
  expense: "bg-red-600/10 text-red-700",
  balanced: "bg-green-600/10 text-green-700",
  warning: "bg-amber-500/10 text-amber-700",
  default: "bg-slate-500/10 text-slate-600",
};

export default function StatusBadge({ label, variant }: { label: string; variant?: string }) {
  const badgeVariant = variant ?? label.toLowerCase();
  return <Text size="xs" className={`w-fit rounded-full px-3 py-1 font-medium ${variants[badgeVariant] ?? variants.default}`}>{label}</Text>;
}
