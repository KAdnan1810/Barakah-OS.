import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { formatCurrency } from "@utils/currency";

/** Eid Budget Planner — simple, local-only planning tool (not persisted to transactions). */
export function EidBudgetPlannerCard() {
  const [gifts, setGifts] = useState(15000);
  const [clothing, setClothing] = useState(12000);
  const [food, setFood] = useState(8000);
  const [charity, setCharity] = useState(10000);
  const [travel, setTravel] = useState(5000);

  const total = gifts + clothing + food + charity + travel;

  const rows: Array<[string, number, (v: number) => void]> = [
    ["Gifts (Eidi)", gifts, setGifts],
    ["Clothing", clothing, setClothing],
    ["Food & Hosting", food, setFood],
    ["Charity", charity, setCharity],
    ["Travel", travel, setTravel],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eid Budget Planner</CardTitle>
        <CardDescription>Plan your Eid spending across categories ahead of time.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.map(([label, value, setter]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <Label className="w-32 shrink-0 font-normal text-muted-foreground">{label}</Label>
            <Input type="number" value={value} onChange={(e) => setter(Number(e.target.value) || 0)} className="w-40" />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium">Total Eid Budget</span>
          <span className="text-lg font-semibold">{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
