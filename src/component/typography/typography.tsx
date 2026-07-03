import type { CSSProperties, ElementType, ReactNode } from "react";

const textSizes = {
  xxs: "text-[10px]",
  xs: "text-xs",
  sm: "text-xs md:text-sm",
  base: "text-sm md:text-base",
  lg: "text-base md:text-lg",
  xl: "text-lg md:text-xl",
  "2xl": "text-xl md:text-2xl",
  "3xl": "text-2xl md:text-3xl",
  "4xl": "text-3xl md:text-4xl",
  "5xl": "text-4xl md:text-5xl",
} as const;

type TextProps = {
  children: ReactNode;
  size?: keyof typeof textSizes;
  className?: string;
  tag?: ElementType;
  style?: CSSProperties;
};

export default function Text({ children, size = "base", className = "", tag: Tag = "p", style }: TextProps) {
  return (
    <Tag className={`${textSizes[size]} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
