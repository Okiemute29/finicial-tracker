import type { InputHTMLAttributes } from "react";
import { usePasswordVisibility } from "../../hooks/auth/usePasswordVisibility";
import Icon from "../icon/icons";
import AuthGeneralInput from "./authinput";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
  notrequired?: boolean;
};

export default function PasswordInput({ label = "Password", ...rest }: PasswordInputProps) {
  const { isVisible, toggle, inputType } = usePasswordVisibility();

  return (
    <AuthGeneralInput
      label={label}
      type={inputType}
      trailing={
        <button
          type="button"
          onClick={toggle}
          className="text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          <Icon name={isVisible ? "eyeOff" : "eye"} iconClass="h-4 w-4" />
        </button>
      }
      {...rest}
    />
  );
}
