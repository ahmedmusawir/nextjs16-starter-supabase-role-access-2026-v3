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
