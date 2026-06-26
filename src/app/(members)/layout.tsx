import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AppShellPage from "@/components/common/AppShellPage";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

interface LayoutProps {
  children: ReactNode;
}

export default async function MemberLayout({ children }: LayoutProps) {
  await protectPage([AppRole.MEMBER]);

  // Gate-M fix (matches (admin)): 25rem rail persistent >= xl, hamburger slide-over
  // < xl. Navbar (shared) + protectPage unchanged.
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AppShellPage sidebar={<Sidebar />} mobileTitle="Members Portal">
        {children}
      </AppShellPage>
    </div>
  );
}
