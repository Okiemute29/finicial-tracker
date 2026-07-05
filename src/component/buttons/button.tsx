import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon from "../icon/icons";

const padding = {
  sm: "px-4 py-2",
  md: "px-5 py-2.5",
  lg: "px-6 py-3",
};

const variants = {
  primary: "bg-teal-700 text-white hover:bg-teal-800",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600",
  outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const radii = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  pill: "rounded-full",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: keyof typeof padding;
  variant?: keyof typeof variants;
  radius?: keyof typeof radii;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
};

export default function Button({
  children,
  size = "md",
  variant = "primary",
  radius = "pill",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${variants[variant]} ${radii[radius]} ${padding[size]} ${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Icon name="loader" iconClass="h-4 w-4 animate-spin" /> : leftIcon ? <Icon name={leftIcon} iconClass="h-4 w-4" /> : null}
      {children}
      {!loading && rightIcon ? <Icon name={rightIcon} iconClass="h-4 w-4" /> : null}
    </button>
  );
}
