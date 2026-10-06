import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  action?: ReactNode;
  className?: string;
  description: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  title: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  eyebrow,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center text-center", className)}>
      {icon ? (
        <div className="glass-tile mb-6 flex size-14 items-center justify-center rounded-2xl text-foreground">
          {icon}
        </div>
      ) : null}
      {eyebrow ? (
        <p className="mail-preview-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mail-preview-heading mt-2 text-3xl font-semibold text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

export type { EmptyStateProps };
