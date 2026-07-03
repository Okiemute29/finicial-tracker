import Icon from "../../icon/icons";
import Text from "../../typography/typography";

type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  icon?: string;
  accent?: boolean;
};

export default function MetricCard({ label, value, change, icon = "trend", accent = false }: MetricCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? "bg-gradient-blue text-white" : "border border-slate-200 bg-white text-slate-950"}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <Text size="sm" className={accent ? "text-white/80" : "text-slate-500"}>{label}</Text>
        <span className={`grid h-9 w-9 place-items-center rounded-full ${accent ? "bg-white/15" : "bg-slate-100"}`}>
          <Icon name={icon} iconClass="h-5 w-5" />
        </span>
      </div>
      <Text size="3xl" className="font-bold">{value}</Text>
      {change ? <Text size="xs" className={`mt-2 ${accent ? "text-white/70" : "text-slate-500"}`}>{change}</Text> : null}
    </div>
  );
}
