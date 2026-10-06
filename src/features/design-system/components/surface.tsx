import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type SurfaceVariant = "glass" | "strong" | "tile" | "modal";
type SurfacePadding = "none" | "sm" | "md" | "lg";

const variants: Record<SurfaceVariant, string> = {
  glass: "glass",
  strong: "glass-strong",
  tile: "glass-tile",
  modal: "glass-modal",
};

const paddings: Record<SurfacePadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

type SurfaceProps<T extends ElementType = "div"> = {
  as?: T;
  padding?: SurfacePadding;
  variant?: SurfaceVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Surface<T extends ElementType = "div">({
  as,
  className,
  padding = "md",
  variant = "glass",
  ...props
}: SurfaceProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-2xl",
        variants[variant],
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

export type { SurfacePadding, SurfaceProps, SurfaceVariant };
