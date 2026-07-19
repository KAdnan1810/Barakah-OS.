import { useState } from "react";
import { PageHeader } from "@components/shared/PageHeader";
import { cn } from "@lib/utils";
import { ZakatCalculatorPage } from "./ZakatCalculatorPage";
import { SadaqahTrackerPage } from "./SadaqahTrackerPage";
import { RamadanTrackerCard } from "../ramadan/RamadanTrackerCard";
import { EidBudgetPlannerCard } from "../eid/EidBudgetPlannerCard";

const tabs = [
  { id: "zakat", label: "Zakat Calculator" },
  { id: "sadaqah", label: "Sadaqah Tracker" },
  { id: "ramadan", label: "Ramadan Tracker" },
  { id: "eid", label: "Eid Planner" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function IslamicFinancePage() {
  const [active, setActive] = useState<TabId>("zakat");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Islamic Finance" description="Zakat, Sadaqah, Ramadan giving, and Eid planning — all in one place." />

      <div className="flex gap-1 rounded-xl bg-secondary/60 p-1 sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active === t.id ? "bg-card shadow-subtle text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "zakat" && <ZakatCalculatorPage />}
      {active === "sadaqah" && <SadaqahTrackerPage />}
      {active === "ramadan" && <RamadanTrackerCard />}
      {active === "eid" && <EidBudgetPlannerCard />}
    </div>
  );
}
