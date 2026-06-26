/**
 * AppShellPage — full-bleed app surface: a persistent sidebar (>= lg) + main column,
 * with a built-in mobile slide-over drawer (< lg) for the sidebar. This is the CLEAN
 * reusable primitive the COMPONENT_REGISTRY always promised — promoted UP into the kit
 * (Cyber Pharma solved this ad-hoc several times and never extracted it). Blessed
 * reference version.
 *
 * API (verbatim match to the COMPONENT_REGISTRY contract):
 *   { sidebar, children, mobileTitle?, mobileTopBarRight? }
 *   `sidebar` may also be a render-fn `(close) => ReactNode` so a future filter/detail
 *   panel can close the drawer on a terminal action (CP scar #2). A plain ReactNode
 *   (e.g. <AdminSidebar/>) works unchanged.
 *
 * Pre-Write Check:
 *   1. Primitives: Sheet (Radix-dialog slide-over), lucide Menu. Considered raw flex +
 *      `hidden md:block` — rejected; that's the Gate-M violation this replaces.
 *   2. Manual ref: UI-UX-BUILDING-MANUAL Rule Zero (sidebar -> slide-over below the
 *      rail's fit breakpoint); COMPONENT_REGISTRY AppShellPage; FFM 13.1 Gate M.
 *   3. 375 sketch: a slim nav-token trigger bar (hamburger 44px + text title) sits
 *      under the shared global Navbar; main content full-width below; the sidebar
 *      lives in a left Sheet (<= 85vw) opened by the hamburger; outside-tap / Esc /
 *      nav all dismiss it.
 *   4. 768: unchanged from 375 — a 25rem rail does not fit at md, so it stays a
 *      slide-over. 1024 (lg): sidebar becomes persistent (w-[25rem], border-r); the
 *      mobile bar + drawer are hidden; main takes the remainder.
 *   Touch targets: hamburger h-11 w-11 (44px). Tokens: --nav-bg / --nav-foreground.
 *
 * CP scars inherited (fixed across several AuthedShell rounds — do not rediscover):
 *   1. close-on-nav        — usePathname effect closes the drawer on route change.
 *   2. close-on-terminal   — `close` is passed to a render-fn sidebar for Apply/Done.
 *   3. drawer-width         — ~25rem rail, capped to 85vw so it never overflows 375.
 *   4. no-regress dismiss  — outside-tap + Esc are native Radix; NOT prevented here.
 */
"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type SidebarProp = ReactNode | ((close: () => void) => ReactNode);

interface AppShellPageProps {
  sidebar: SidebarProp;
  children: ReactNode;
  mobileTitle?: string;
  mobileTopBarRight?: ReactNode;
}

export default function AppShellPage({
  sidebar,
  children,
  mobileTitle,
  mobileTopBarRight,
}: AppShellPageProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // CP scar #1 — close the drawer on navigation (tap a sidebar link -> route change).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // CP scar #2 — sidebar may be a render-fn so a terminal action (Apply/Done) can close.
  const close = () => setOpen(false);
  const renderSidebar = () =>
    typeof sidebar === "function" ? sidebar(close) : sidebar;

  return (
    <div className="flex flex-1 flex-col">
      {/* Mobile trigger bar (< lg). Two-bar pattern: sits under the shared Navbar. */}
      <div className="flex items-center gap-3 bg-nav-bg px-4 py-2 text-nav-foreground lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-nav-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="h-5 w-5" />
        </button>
        {mobileTitle && <span className="text-sm font-medium">{mobileTitle}</span>}
        {mobileTopBarRight && <div className="ml-auto">{mobileTopBarRight}</div>}
      </div>

      <div className="flex flex-1">
        {/* Persistent sidebar (>= lg) */}
        <aside className="hidden w-[25rem] flex-shrink-0 border-r border-border lg:block">
          {renderSidebar()}
        </aside>

        {/* Mobile slide-over drawer (< lg) */}
        <Sheet open={open} onOpenChange={setOpen}>
          {/* CP scar #3 (~25rem, capped to 85vw) + #4 (native outside-tap/Esc, not prevented) */}
          <SheetContent side="left" className="w-[25rem] max-w-[85vw] p-0">
            <SheetTitle className="sr-only">{mobileTitle ?? "Navigation"}</SheetTitle>
            {renderSidebar()}
          </SheetContent>
        </Sheet>

        <main className="flex-grow">{children}</main>
      </div>
    </div>
  );
}
