import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card p-12 flex flex-col items-center text-center gap-3">
      <div className="size-12 rounded-full bg-primary-light text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
