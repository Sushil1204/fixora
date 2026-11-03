import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover focus-visible:outline-brand-deep",
  secondary:
    "border border-line bg-surface text-ink hover:border-line-strong hover:bg-brand-subtle focus-visible:outline-brand",
  ghost:
    "text-brand hover:bg-brand-soft focus-visible:outline-brand-deep",
  danger:
    "bg-danger text-white hover:bg-[#a92a2a] focus-visible:outline-[#a92a2a]",
  inverse:
    "bg-white text-brand-deep hover:bg-brand-soft focus-visible:outline-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-[52px] px-6 text-base",
};

/** Class recipe so links can look like buttons without an extra wrapper. */
export function buttonStyles(
  options: { variant?: Variant; size?: Size; fullWidth?: boolean } = {},
): string {
  const { variant = "primary", size = "md", fullWidth } = options;
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}
