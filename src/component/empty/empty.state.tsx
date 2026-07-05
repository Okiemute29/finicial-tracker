import type { ReactNode } from "react";
import Icon from "../icon/icons";
import Text from "../typography/typography";

export default function EmptyState({ icon = "search", title, description, action }: { icon?: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon name={icon} iconClass="h-7 w-7 text-slate-400 dark:text-slate-500" />
      </div>
      <Text size="lg" className="font-semibold text-slate-950 dark:text-white">{title}</Text>
      {description ? <Text size="sm" className="mt-1 max-w-sm text-slate-500 dark:text-slate-400">{description}</Text> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
