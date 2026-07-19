import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@components/ui/button";
import { useAuth } from "@features/auth/hooks/useAuth";

export function Topbar({ onQuickAdd }: { onQuickAdd: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="text-sm text-muted-foreground">
        As-salamu alaykum, <span className="font-medium text-foreground">{user?.fullName ?? "there"}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onQuickAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Quick Add
        </Button>
        <Button size="icon" variant="ghost" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <ThemeToggle />
        <Button
          size="icon"
          variant="ghost"
          aria-label="Log out"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </header>
  );
}
