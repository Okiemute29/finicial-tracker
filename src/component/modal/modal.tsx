import { useEffect } from "react";
import type { ReactNode } from "react";
import Button from "../buttons/button";
import Text from "../typography/typography";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({ isOpen, onClose, title, subtitle, children, size = "md" }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/40" />
      <div className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl ${sizes[size]}`} onClick={(event) => event.stopPropagation()}>
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <Text size="lg" className="font-semibold text-slate-950">{title}</Text>
              {subtitle ? <Text size="sm" className="text-slate-500">{subtitle}</Text> : null}
            </div>
            <Button variant="ghost" radius="md" size="sm" onClick={onClose}>Close</Button>
          </div>
        ) : null}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
