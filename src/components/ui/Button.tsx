import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ag-green text-white hover:bg-ag-green-dark active:bg-ag-green-dark disabled:bg-border disabled:text-foreground-muted",
  secondary:
    "bg-ag-blue text-white hover:bg-ag-blue-dark active:bg-ag-blue-dark disabled:bg-border disabled:text-foreground-muted",
  outline:
    "border border-border bg-white text-foreground hover:bg-surface disabled:text-foreground-muted",
  ghost: "text-foreground hover:bg-surface disabled:text-foreground-muted",
  danger: "bg-danger text-white hover:brightness-90 disabled:bg-border disabled:text-foreground-muted",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-xl",
  lg: "h-13 px-6 text-base rounded-xl",
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 select-none disabled:cursor-not-allowed active:scale-[0.98]";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
