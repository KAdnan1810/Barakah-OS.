import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { formatCurrency } from "@utils/currency";
import { calculateZakat, type ZakatResult } from "../zakat/lib/calculateZakat";

const schema = z.object({
  cashAndBank: z.coerce.number().min(0),
  goldSilverValue: z.coerce.number().min(0),
  businessAssets: z.coerce.number().min(0),
  investmentValue: z.coerce.number().min(0),
  immediateLiabilities: z.coerce.number().min(0),
  goldPricePerGram: z.coerce.number().positive(),
});
type FormValues = z.infer<typeof schema>;

export function ZakatCalculatorPage() {
  const [result, setResult] = useState<ZakatResult | null>(null);
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cashAndBank: 250000,
      goldSilverValue: 150000,
      businessAssets: 0,
      investmentValue: 212000,
      immediateLiabilities: 0,
      goldPricePerGram: 6700,
    },
  });

  const onSubmit = (values: FormValues) => setResult(calculateZakat(values));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HandCoins className="h-4 w-4 text-gold" /> Zakat Calculator</CardTitle>
          <CardDescription>Nisab-based method — 2.5% of net zakatable wealth held over a lunar year.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cashAndBank">Cash & bank balances (₹)</Label>
              <Input id="cashAndBank" type="number" {...register("cashAndBank")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goldSilverValue">Gold & silver value (₹)</Label>
              <Input id="goldSilverValue" type="number" {...register("goldSilverValue")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="investmentValue">Shariah investment value (₹)</Label>
              <Input id="investmentValue" type="number" {...register("investmentValue")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessAssets">Business assets / receivables (₹)</Label>
              <Input id="businessAssets" type="number" {...register("businessAssets")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="immediateLiabilities">Immediate liabilities due (₹)</Label>
              <Input id="immediateLiabilities" type="number" {...register("immediateLiabilities")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goldPricePerGram">Current gold price (₹/gram)</Label>
              <Input id="goldPricePerGram" type="number" {...register("goldPricePerGram")} />
            </div>
            <Button type="submit" className="mt-1">Calculate Zakat</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Result</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!result ? (
            <p className="text-sm text-muted-foreground">Fill in the form and calculate to see your Zakat due.</p>
          ) : (
            <>
              <div className="rounded-2xl bg-gold/10 p-5 text-center">
                <p className="text-xs text-muted-foreground">Zakat Due</p>
                <p className="text-3xl font-bold text-gold">{formatCurrency(result.zakatDue)}</p>
                <Badge variant={result.meetsNisab ? "success" : "outline"} className="mt-2">
                  {result.meetsNisab ? "Meets Nisab threshold" : "Below Nisab — Zakat not obligatory"}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Nisab threshold</span><span>{formatCurrency(result.nisabThreshold)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total zakatable assets</span><span>{formatCurrency(result.totalZakatableAssets)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Net after liabilities</span><span>{formatCurrency(result.netZakatableAssets)}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">
                This is a general estimate. For complex cases (business inventory, agricultural Zakat, mixed currencies), consult a qualified scholar.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
