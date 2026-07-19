import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { cn } from "@lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon: LucideIcon;
  accent?: "primary" | "gold" | "danger";
}

export function StatCard({ label, value, delta, icon: Icon, accent = "primary" }: StatCardProps) {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/10 text-gold",
    danger: "bg-danger/10 text-danger",
  }[accent];

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {delta && (
            <span
              className={cn(
                "text-xs font-medium",
                delta.positive ? "text-success" : "text-danger"
              )}
            >
              {delta.value}
            </span>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentClasses)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
