/**
 * PublicNav — public/marketing top nav: logo + 3 portal links + theme + auth island.
 * Portal links are always visible (RBAC = protectPage redirect on each portal layout,
 * not nav-level hide/show).
 *
 * Pre-Write Check:
 *   1. Primitives: next/link, ThemeToggle, PublicNavAuthSection.
 *   2. Manual ref: COMPONENT_REGISTRY (Navbar variants); UI-UX Rule Zero.
 *   3. 375 sketch: nav-token bar; the 3 portal links reflow to a centered full-width
 *      row (flex-wrap / order-*); theme + auth island share the bar.
 *   4. lg (1024)+: logo, horizontal links, theme + auth align on one row.
 *   Touch targets: portal links + Login meet 44px on touch (Gate-4 floor).
 */
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import PublicNavAuthSection from "./PublicNavAuthSection";

// Server shell. Three portal links are ALWAYS visible — RBAC enforcement
// is the protectPage redirect-on-click on each portal layout (N5-CORRECTED),
// not nav-level show/hide. Theme toggle + auth state are client islands.
const PublicNav = () => {
  return (
    <div className="bg-nav-bg text-nav-foreground py-2 px-5 flex flex-wrap items-center justify-between gap-y-2">
      <Link href="/" className="font-bold text-lg tracking-tight">
        Starter Kit
      </Link>

      <nav className="order-3 lg:order-2 w-full lg:w-auto flex justify-center gap-1">
        <Link
          href="/members-portal"
          className="px-3 py-2 text-sm font-medium rounded-md hover:bg-nav-foreground/10"
        >
          Member Portal
        </Link>
        <Link
          href="/admin-portal"
          className="px-3 py-2 text-sm font-medium rounded-md hover:bg-nav-foreground/10"
        >
          Admin Portal
        </Link>
        <Link
          href="/superadmin-portal"
          className="px-3 py-2 text-sm font-medium rounded-md hover:bg-nav-foreground/10"
        >
          Super Admin Portal
        </Link>
      </nav>

      <div className="order-2 lg:order-3 flex items-center">
        <ThemeToggle />
        <PublicNavAuthSection />
      </div>
    </div>
  );
};

export default PublicNav;
