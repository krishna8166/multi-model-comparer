import { useAuth } from "@/contexts/AuthContext";
import { Zap, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface NavbarProps {
  dailyUsage: number;
  maxUsage: number;
}

const Navbar = ({ dailyUsage, maxUsage }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">AI Compare</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-mono text-secondary-foreground">
            <span>{dailyUsage}</span>
            <span className="text-muted-foreground">/</span>
            <span>{maxUsage}</span>
            <span className="text-muted-foreground ml-1">today</span>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <button
              onClick={signOut}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
