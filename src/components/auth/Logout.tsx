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
      console.error("Failed to log out");
    }
  };
}

const Logout = () => {
  const handleLogout = useLogoutHandler();
  return <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>;
};

export default Logout;
