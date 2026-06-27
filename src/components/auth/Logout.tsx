"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export function useLogoutHandler() {
  const router = useRouter();
  return async () => {
    try {
      await useAuthStore.getState().logout();
      router.refresh();
      router.push("/auth");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };
}

const Logout = () => {
  const handleLogout = useLogoutHandler();
  return (
    <DropdownMenuItem
      onSelect={handleLogout}
      className="pointer-coarse:min-h-11"
    >
      Logout
    </DropdownMenuItem>
  );
};

export default Logout;
