import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

interface LayoutProps {
  children: ReactNode;
}

// Shared account area (e.g. /profile) reachable by ADMIN or MEMBER — NOT superadmin
// (superadmin is console-managed; its Profile link is hidden in the navbars). This is
// a Navbar-only account chrome: no portal sidebar, since /profile is cross-portal.
export default async function AccountLayout({ children }: LayoutProps) {
  await protectPage([AppRole.ADMIN, AppRole.MEMBER]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
