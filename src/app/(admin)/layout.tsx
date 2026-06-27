import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AppShellPage from "@/components/common/AppShellPage";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

interface LayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  await protectPage([AppRole.ADMIN]);

  // Gate-M fix: the 25rem rail is persistent >= xl and a hamburger-triggered
  // slide-over < xl (was `hidden md:block` with no trigger). Navbar (shared)
  // stays the top bar on all sizes; AppShellPage adds the mobile trigger below it.
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AppShellPage sidebar={<AdminSidebar />} mobileTitle="Admin Portal">
        {children}
      </AppShellPage>
    </div>
  );
}
