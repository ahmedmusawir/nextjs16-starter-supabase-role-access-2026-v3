import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import SuperadminSidebar from "@/components/layout/SuperadminSidebar";
import AppShellPage from "@/components/common/AppShellPage";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

interface LayoutProps {
  children: ReactNode;
}

export default async function SuperAdminLayout({ children }: LayoutProps) {
  await protectPage([AppRole.SUPERADMIN]);

  // Gate-M fix (matches (admin)): 25rem rail persistent >= xl, hamburger slide-over
  // < xl. Navbar (shared) + protectPage unchanged.
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AppShellPage sidebar={<SuperadminSidebar />} mobileTitle="Superadmin Portal">
        {children}
      </AppShellPage>
    </div>
  );
}
