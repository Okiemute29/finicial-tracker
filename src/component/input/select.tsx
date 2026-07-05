import type { SelectHTMLAttributes } from "react";
import Text from "../typography/typography";

type Option = { label: string; value: string };
type OptionGroup = { label: string; options: Option[] };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options?: Option[];
  groups?: OptionGroup[];
  error?: string;
  description?: string;
  notrequired?: boolean;
  change?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function Select({ label, options, groups, error, description, notrequired, change, id, name, className = "", ...rest }: SelectProps) {
  const inputId = id ?? name;
  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {!notrequired ? <span className="text-red-500 dark:text-red-400">*</span> : null}
        </label>
      ) : null}
      <select
        id={inputId}
        name={name}
        required={!notrequired}
        onChange={change}
        className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-700 dark:bg-slate-900 dark:text-white ${error ? "border-red-500" : "border-slate-200 dark:border-slate-700"} ${className}`}
        {...rest}
      >
        {groups
          ? groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ))
          : (options ?? []).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
      </select>
      {error ? <Text size="xs" className="mt-1 text-red-500 dark:text-red-400">{error}</Text> : null}
      {!error && description ? <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-400">{description}</Text> : null}
    </div>
  );
}
