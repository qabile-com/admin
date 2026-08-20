import type { ComponentType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** "compact" — bordered box, centered (stat strips). "card" — full Card with an icon. */
  variant?: "compact" | "card";
  icon?: ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
}

export function StatTile({
  label,
  value,
  variant = "compact",
  icon: Icon,
  loading,
  className,
}: StatTileProps) {
  if (variant === "card") {
    return (
      <Card className={cn("h-full transition-colors group-hover:border-orange-300/30", className)}>
        <CardContent className="flex items-center justify-between p-5">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-black">{value}</p>
            )}
          </div>
          {Icon && (
            <IconCircle tone="brand" size="size-11" className="rounded-lg">
              <Icon className="size-5" />
            </IconCircle>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-black/10 py-3 text-center", className)}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
