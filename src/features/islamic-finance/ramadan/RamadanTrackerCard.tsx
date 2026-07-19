import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

/** Ramadan Donation Tracker — surfaces Sadaqah entries flagged as Ramadan giving. */
export function RamadanTrackerCard() {
  const { sadaqahEntries } = useAppStore();
  const ramadanEntries = sadaqahEntries.filter((s) => s.isRamadan);
  const total = ramadanEntries.reduce((a, s) => a + s.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ramadan Donation Tracker</CardTitle>
        <CardDescription>Donations tagged as Ramadan giving, in one place.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-2xl font-semibold text-gold">{formatCurrency(total)}</p>
        {ramadanEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Ramadan donations logged yet — tag any Sadaqah entry as Ramadan giving to see it here.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {ramadanEntries.map((e) => (
              <div key={e.id} className="flex justify-between py-2 text-sm">
                <span>{e.recipient ?? "Sadaqah"}</span>
                <span className="font-medium">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
