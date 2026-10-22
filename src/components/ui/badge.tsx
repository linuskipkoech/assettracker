import type { ReactNode } from "react";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info";

const TONE_CLASS: Record<Tone, string> = {
  default: "bg-border/60 text-foreground",
  primary: "bg-primary-light text-primary-dark",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
};

export function Badge({
  children,
  tone = "default",
  icon,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`badge ${TONE_CLASS[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}
