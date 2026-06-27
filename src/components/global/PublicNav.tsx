/**
 * PublicNav — public/marketing top nav: logo + 3 portal links + theme + auth island.
 * Portal links are always visible (RBAC = protectPage redirect on each portal layout,
 * not nav-level hide/show).
 *
 * Pre-Write Check:
 *   1. Primitives: next/link, ThemeToggle, PublicNavAuthSection.
 *   2. Manual ref: COMPONENT_REGISTRY (Navbar variants); UI-UX Rule Zero.
 *   3. 375 sketch: nav-token bar — a 44px hamburger (PublicMobileNav) on the left
 *      opens a left Sheet with the 3 portal links; logo beside it; theme + auth
 *      island stay top-level on the right (Login is one-tap, never behind the menu).
 *   4. lg (1024)+: hamburger hidden; the 3 portal links render as a horizontal row;
 *      theme + auth on the right. (lg, NOT xl — a horizontal nav of 3 short links
 *      fits at 1024; xl is the portals' 25rem-rail rule, not a blanket kit law.)
 *   Touch targets: portal links + Login meet 44px on touch (Gate-4 floor); the
 *      hamburger + mobile-menu links are 44px.
 */
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import PublicNavAuthSection from "./PublicNavAuthSection";
import PublicMobileNav from "./PublicMobileNav";

// Server shell. Three portal links are ALWAYS visible — RBAC enforcement
// is the protectPage redirect-on-click on each portal layout (N5-CORRECTED),
// not nav-level show/hide. Theme toggle + auth state are client islands.
// Below lg the links live in PublicMobileNav's hamburger Sheet; at lg+ they
// render as the horizontal <nav> here.
const PublicNav = () => {
  return (
    <div className="bg-nav-bg text-nav-foreground py-2 px-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <PublicMobileNav />
        <Link href="/" className="font-bold text-lg tracking-tight">
          Starter Kit
        </Link>
      </div>

      <nav className="hidden lg:flex justify-center gap-1">
        <Link
          href="/members-portal"
          className="px-3 py-2 text-sm font-medium rounded-md hover:bg-nav-foreground/10 inline-flex items-center coarse:min-h-11"
        >
          Member Portal
        </Link>
        <Link
          href="/admin-portal"
          className="px-3 py-2 text-sm font-medium rounded-md hover:bg-nav-foreground/10 inline-flex items-center coarse:min-h-11"
        >
          Admin Portal
        </Link>
        <Link
          href="/superadmin-portal"
          className="px-3 py-2 text-sm font-medium rounded-md hover:bg-nav-foreground/10 inline-flex items-center coarse:min-h-11"
        >
          Super Admin Portal
        </Link>
      </nav>

      <div className="flex items-center">
        <ThemeToggle />
        <PublicNavAuthSection />
      </div>
    </div>
  );
};

export default PublicNav;
