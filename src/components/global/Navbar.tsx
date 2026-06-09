"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "./ThemeToggle";
import Logout from "../auth/Logout";
import { User as SupabaseUser } from "@supabase/auth-js";
import { createClient } from "@/utils/supabase/client";

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // N4: createClient inside the effect so this is prerender-safe.
    const supabase = createClient();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    fetchUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-nav-bg text-nav-foreground py-2 px-5 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg tracking-tight">
        Starter Kit
      </Link>

      <div className="flex items-center">
        <ThemeToggle />

        {!isLoading && (
          <>
            {user && <span className="mr-3 text-sm hidden md:inline">{user.email}</span>}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Avatar>
                    <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover text-popover-foreground">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <Logout />
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!user && (
              <Link
                href="/auth"
                className="ml-3 text-sm font-medium hover:underline"
              >
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
