import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";
import { GoalFormDialog } from "../components/GoalFormDialog";

function projectedCompletion(current: number, target: number, deadline?: string | null) {
  if (current >= target) return "Completed";
  if (!deadline) return "No deadline set";
  const monthsLeft = Math.max(
    1,
    Math.round((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
  );
  const neededPerMonth = (target - current) / monthsLeft;
  return `${formatCurrency(neededPerMonth)}/month needed`;
}

export function GoalsPage() {
  const { goals, contributeToGoal } = useAppStore();
  const [formOpen, setFormOpen] = useState(false);
  const [contribution, setContribution] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Goals" description="Unlimited financial goals, each with its own target and timeline."
        action={<Button onClick={() => setFormOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> New Goal</Button>} />

      {goals.length === 0 ? (
        <Card><CardContent className="p-6"><EmptyState icon={Target} title="No goals yet" description="Create your first goal — a trip, a purchase, anything." actionLabel="New Goal" onAction={() => setFormOpen(true)} /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => {
            const pct = (g.currentAmount / g.targetAmount) * 100;
            return (
              <Card key={g.id}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{g.name}</p>
                    <Badge variant={g.status === "completed" ? "success" : "outline"} className="capitalize">
                      {g.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <Progress value={pct} />
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{formatCurrency(g.currentAmount)}</span>
                    <span className="text-muted-foreground">of {formatCurrency(g.targetAmount)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{projectedCompletion(g.currentAmount, g.targetAmount, g.deadline)}</p>
                  {g.status !== "completed" && (
                    <div className="flex gap-2 pt-1">
                      <Input
                        placeholder="Add amount"
                        type="number"
                        className="h-8 text-xs"
                        value={contribution[g.id] ?? ""}
                        onChange={(e) => setContribution((c) => ({ ...c, [g.id]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const amt = Number(contribution[g.id]);
                          if (amt > 0) {
                            contributeToGoal(g.id, amt);
                            setContribution((c) => ({ ...c, [g.id]: "" }));
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <GoalFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
