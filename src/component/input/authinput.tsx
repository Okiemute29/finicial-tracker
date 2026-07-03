import type { InputHTMLAttributes } from "react";
import Text from "../typography/typography";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  description?: string;
  notrequired?: boolean;
  inputClass?: string;
  change?: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  ...rest
}: InputProps) {
  const inputId = id ?? name;
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
          {label}
          {!notrequired ? <span className="text-red-500">*</span> : null}
        </label>
      ) : null}
      <input
        id={inputId}
        name={name}
        required={!notrequired}
        onChange={change}
        className={`h-12 w-full rounded-lg border bg-white px-4 text-sm outline-none transition focus:border-teal-700 ${error ? "border-red-500" : "border-slate-200"} ${inputClass}`}
        {...rest}
      />
      {error ? <Text size="xs" className="mt-1 text-red-500">{error}</Text> : null}
      {!error && description ? <Text size="xs" className="mt-1 text-slate-500">{description}</Text> : null}
    </div>
  );
}
