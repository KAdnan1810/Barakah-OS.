import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Receipt, Wallet, PiggyBank, Landmark, Target,
  ShieldCheck, Briefcase, Gem, CalendarClock, HandCoins, TrendingUp,
  BarChart3, Sparkles, Settings, Moon, ChevronsLeft,
} from "lucide-react";
import { cn } from "@lib/utils";
import { useUIStore } from "@store/ui-store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/income", label: "Income", icon: Wallet },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/emergency-fund", label: "Emergency Fund", icon: ShieldCheck },
  { to: "/business-fund", label: "Business Fund", icon: Briefcase },
  { to: "/investments", label: "Halal Investments", icon: Gem },
  { to: "/loans", label: "Loans & EMI", icon: CalendarClock },
  { to: "/islamic-finance", label: "Islamic Finance", icon: HandCoins },
  { to: "/net-worth", label: "Net Worth", icon: TrendingUp },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-card/50 transition-all duration-300 md:flex",
        sidebarCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Moon className="h-4 w-4" fill="currentColor" />
        </div>
        {!sidebarCollapsed && <span className="text-sm font-semibold tracking-tight">Barakah OS</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-none">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
            title={item.label}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )
          }
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronsLeft className={cn("h-[18px] w-[18px] shrink-0 transition-transform", sidebarCollapsed && "rotate-180")} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
