import { toast } from "sonner";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Select } from "@components/ui/select";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { ThemeToggle } from "@components/layout/ThemeToggle";
import { isSupabaseConfigured } from "@services/supabaseClient";
import { Badge } from "@components/ui/badge";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Appearance, currency, and connection status." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose light, dark, or match your system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>Used across all balances and reports.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Label htmlFor="currency" className="w-24 font-normal text-muted-foreground">Base currency</Label>
          <Select id="currency" defaultValue="INR" className="w-40" onChange={() => toast.info("Currency preference saved")}>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="AED">AED (د.إ)</option>
            <option value="SAR">SAR (﷼)</option>
            <option value="GBP">GBP (£)</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backend Connection</CardTitle>
          <CardDescription>Whether the app is running against Supabase or local demo data.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <Badge variant={isSupabaseConfigured ? "success" : "warning"}>
              {isSupabaseConfigured ? "Connected to Supabase" : "Demo mode (local data)"}
            </Badge>
            {!isSupabaseConfigured && (
              <p className="mt-2 text-xs text-muted-foreground">
                Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to connect a real backend.
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => toast.info("See .env.example for setup instructions")}>
            Setup guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
