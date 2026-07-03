import type { TextareaHTMLAttributes } from "react";
import Text from "../typography/typography";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  description?: string;
  notrequired?: boolean;
  change?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextArea({ label, error, description, notrequired, change, id, name, className = "", ...rest }: TextAreaProps) {
  const inputId = id ?? name;
  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
          {label}
          {!notrequired ? <span className="text-red-500">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={inputId}
        name={name}
        required={!notrequired}
        onChange={change}
        className={`min-h-28 w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-700 ${error ? "border-red-500" : "border-slate-200"} ${className}`}
        {...rest}
      />
      {error ? <Text size="xs" className="mt-1 text-red-500">{error}</Text> : null}
      {!error && description ? <Text size="xs" className="mt-1 text-slate-500">{description}</Text> : null}
    </div>
  );
}
