import { ReactNode } from "react";
import PublicNav from "@/components/global/PublicNav";
import Main from "@/components/common/Main";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <PublicNav />
        <Main className="flex flex-col">
          {children
            ? children
            : "This is a Layout container. Must have children"}
        </Main>
      </div>
    </>
  );
}
