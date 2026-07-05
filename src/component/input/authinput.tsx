import type { InputHTMLAttributes, ReactNode } from "react";
import Text from "../typography/typography";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  description?: string;
  notrequired?: boolean;
  inputClass?: string;
  change?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  trailing?: ReactNode;
};

export default function AuthGeneralInput({
  label,
  error,
  description,
  notrequired,
  inputClass = "",
  change,
  className = "",
  id,
  name,
  trailing,
  ...rest
}: InputProps) {
  const inputId = id ?? name;
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {!notrequired ? <span className="text-red-500 dark:text-red-400">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          required={!notrequired}
          onChange={change}
          className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${trailing ? "pr-11" : ""} ${error ? "border-red-500" : "border-slate-200 dark:border-slate-700"} ${inputClass}`}
          {...rest}
        />
        {trailing ? <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div> : null}
      </div>
      {error ? <Text size="xs" className="mt-1 text-red-500 dark:text-red-400">{error}</Text> : null}
      {!error && description ? <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-400">{description}</Text> : null}
    </div>
  );
}
