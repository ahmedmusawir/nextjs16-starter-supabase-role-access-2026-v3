/**
 * PublicMobileNav — the public/marketing nav's mobile menu (< lg). A hamburger that
 * opens a left Sheet holding the 3 portal links. Matches the kit's blessed pattern
 * (the same Sheet primitive the portals' AppShellPage uses) rather than a one-off
 * dropdown. Carries ONLY navigation — theme + auth stay top-level in PublicNav.
 *
 * Pre-Write Check:
 *   1. Primitives: Sheet (Radix-dialog slide-over), lucide Menu, next/link.
 *   2. Manual ref: COMPONENT_REGISTRY (Sheet); UI-UX Rule Zero; recon Q11.1/Q11.5
 *      (marketing nav earns a hamburger; controls stay outside the menu).
 *   3. 375 sketch: a 44px hamburger (left, next to the logo); tap opens a left Sheet
 *      (<= 85vw) listing the 3 portal links; outside-tap / Esc / nav all dismiss it.
 *   4. lg (1024)+: this whole island is `lg:hidden` — the links render as a
 *      horizontal row in PublicNav instead. (lg, NOT xl: a horizontal nav of 3 short
 *      links fits at 1024; xl is the portals' 25rem-rail rule, not a blanket law.)
 *   Touch targets: hamburger is explicit h-11 w-11 (44px); menu links use min-h-11.
 */
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const PORTAL_LINKS = [
  { href: "/members-portal", label: "Member Portal" },
  { href: "/admin-portal", label: "Admin Portal" },
  { href: "/superadmin-portal", label: "Super Admin Portal" },
];

const PublicMobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation (tap a link -> route change). Outside-tap + Esc
  // dismiss come free from the Sheet (Radix) — not prevented.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-nav-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[18rem] max-w-[85vw]">
          <SheetTitle>Menu</SheetTitle>
          <nav className="mt-6 flex flex-col gap-1">
            {PORTAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PublicMobileNav;
