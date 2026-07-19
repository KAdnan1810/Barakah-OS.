import { useState } from "react";
import { Plus, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { EmptyState } from "@components/shared/EmptyState";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";
import { SadaqahFormDialog } from "../sadaqah/components/SadaqahFormDialog";

export function SadaqahTrackerPage() {
  const { sadaqahEntries } = useAppStore();
  const [open, setOpen] = useState(false);

  const total = sadaqahEntries.reduce((a, s) => a + s.amount, 0);
  const ramadanTotal = sadaqahEntries.filter((s) => s.isRamadan).reduce((a, s) => a + s.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sadaqah Tracker</h2>
          <p className="text-sm text-muted-foreground">Every act of charity, recorded with gratitude.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Log Sadaqah</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Total Given</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold">{formatCurrency(total)}</span></CardContent></Card>
        <Card><CardHeader><CardTitle>Ramadan Donations</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold text-gold">{formatCurrency(ramadanTotal)}</span></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {sadaqahEntries.length === 0 ? (
            <div className="p-6"><EmptyState icon={Gift} title="No Sadaqah logged yet" description="Record your giving to see your generosity over time." actionLabel="Log Sadaqah" onAction={() => setOpen(true)} /></div>
          ) : (
            <div className="divide-y divide-border">
              {sadaqahEntries.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{s.recipient ?? "Sadaqah"}</p>
                      {s.isRamadan && <Badge variant="gold">Ramadan</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {s.note ? ` · ${s.note}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(s.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SadaqahFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
