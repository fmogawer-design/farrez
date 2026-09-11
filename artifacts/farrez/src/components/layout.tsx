import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { CreditCard, FileText, Store, BarChart2, History, Settings, User, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useGetBillingCheckoutSession, getGetBillingCheckoutSessionQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  // Safely check pro status to reflect in UI
  const checkoutSessionId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("session_id")
      : null;
  const checkoutSessionParams = { sessionId: checkoutSessionId ?? "" };
  const { data: checkoutData } = useGetBillingCheckoutSession(checkoutSessionParams, {
    query: {
      queryKey: getGetBillingCheckoutSessionQueryKey(checkoutSessionParams),
      enabled: Boolean(checkoutSessionId),
      retry: false,
    },
  });

  const hasActivePro =
    typeof checkoutData === "object" &&
    checkoutData !== null &&
    checkoutData.status === "complete" &&
    ["active", "trialing"].includes(checkoutData.subscriptionStatus ?? "");

  const getNavClass = (path: string, active: boolean) => {
    return `flex flex-col items-center justify-center gap-space-xs w-20 sm:w-28 h-12 sm:h-14 rounded-lg transition-colors ${
      active
        ? "text-primary bg-primary/10"
        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
    }`;
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-surface w-full">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-sm max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-space-sm min-w-0" data-testid="brand-farrez">
            <img alt="Farrez Logo" className="h-8 w-8 object-contain shrink-0" src="/farrez-logo.png" />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate">Farrez</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                {location.startsWith("/analysis") ? "Results And Analysis" 
                 : location.startsWith("/vendors") ? "Vendor Directory"
                 : location.startsWith("/history") ? "Comparison History"
                 : location.startsWith("/pro") ? "Pro Subscription"
                 : "Compare Quotations"}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-space-sm shrink-0">
            <Link
              href="/pro"
              data-testid="button-farrez-pro"
              className="flex items-center gap-space-xs bg-primary/15 hover:bg-primary/25 px-space-sm py-1.5 rounded-full text-primary transition-colors"
            >
              <CreditCard size={15} />
              <span className="font-label-sm text-label-sm font-semibold whitespace-nowrap hidden sm:inline-block">
                {hasActivePro ? "Pro Active" : "Farrez Pro"}
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-high/90 px-space-sm py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-secondary font-semibold tracking-wider">KWD</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary/50 transition-all outline-none" data-testid="button-user-profile">
                  <User size={18} className="text-on-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-surface-container border-outline-variant">
                <DropdownMenuLabel className="font-headline-sm text-on-surface">App Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-outline-variant/30" />
                <div className="px-2 py-1.5">
                  <span className="font-label-sm text-on-surface-variant mb-2 block">Theme Preference</span>
                  <div className="flex gap-1 bg-surface-container-highest p-1 rounded-lg">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${theme === "light" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                      title="Light Mode"
                    >
                      <Sun size={16} />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${theme === "dark" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                      title="Dark Mode"
                    >
                      <Moon size={16} />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${theme === "system" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                      title="System Preference"
                    >
                      <Monitor size={16} />
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col relative w-full pt-16 pb-24 px-gutter-sm bg-surface min-h-screen max-w-4xl mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.25)] border-t border-outline-variant/10">
        <div className="flex items-center justify-around h-16 px-gutter-sm max-w-4xl mx-auto">
          <Link href="/" className={getNavClass("/", isActive("/"))}>
            <FileText size={20} />
            <span className="font-label-sm text-label-sm text-center leading-none">Compare</span>
          </Link>
          <Link href="/history" className={getNavClass("/history", isActive("/history"))}>
            <History size={20} />
            <span className="font-label-sm text-label-sm text-center leading-none">History</span>
          </Link>
          <Link href="/vendors" className={getNavClass("/vendors", isActive("/vendors"))}>
            <Store size={20} />
            <span className="font-label-sm text-label-sm text-center leading-none">Vendors</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
