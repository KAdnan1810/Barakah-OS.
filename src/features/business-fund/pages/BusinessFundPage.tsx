import { useState } from "react";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

export function BusinessFundPage() {
  const { businessFund, contributeBusinessFund } = useAppStore();
  const [amount, setAmount] = useState("");

  const pct = (businessFund.currentAmount / businessFund.targetAmount) * 100;
  const remaining = businessFund.targetAmount - businessFund.currentAmount;
  const monthsToTarget = businessFund.monthlyContribution > 0 ? Math.ceil(remaining / businessFund.monthlyContribution) : null;
  const estCompletion = monthsToTarget
    ? new Date(new Date().setMonth(new Date().getMonth() + monthsToTarget)).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Business Fund" description="Capital set aside for growing or starting your business." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-gold" /> Progress</CardTitle>
          <CardDescription>Target: {formatCurrency(businessFund.targetAmount)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold">{formatCurrency(businessFund.currentAmount)}</span>
            <span className="text-sm text-muted-foreground">{pct.toFixed(0)}% funded</span>
          </div>
          <Progress value={pct} indicatorClassName="bg-gold" className="h-3" />
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Monthly contribution</p>
              <p className="text-lg font-semibold">{formatCurrency(businessFund.monthlyContribution)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold">{formatCurrency(remaining)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. completion</p>
              <p className="text-lg font-semibold">{estCompletion}</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Input placeholder="Amount to add" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button
              onClick={() => {
                const amt = Number(amount);
                if (amt > 0) {
                  contributeBusinessFund(amt);
                  setAmount("");
                }
              }}
            >
              Contribute
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
