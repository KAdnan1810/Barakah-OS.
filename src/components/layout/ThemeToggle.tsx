import { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useUIStore, applyTheme } from "@store/ui-store";
import { cn } from "@lib/utils";

const options = [
  { value: "light" as const, icon: Sun },
  { value: "dark" as const, icon: Moon },
  { value: "system" as const, icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border bg-secondary/50 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            theme === opt.value ? "bg-card shadow-subtle text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`${opt.value} theme`}
        >
          <opt.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
