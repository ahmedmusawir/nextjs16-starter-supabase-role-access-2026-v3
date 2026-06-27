/**
 * Navbar — authenticated portal top bar (logo + theme + account). Client island;
 * reads the Supabase user via createClient() inside an effect (prerender-safe, N4).
 *
 * Pre-Write Check:
 *   1. Primitives: Avatar, DropdownMenu, ThemeToggle, Logout (+ supabase client).
 *   2. Manual ref: COMPONENT_REGISTRY (Navbar); UI-UX Rule Zero.
 *   3. 375 sketch: full-width nav-token bar — logo left; theme + avatar-dropdown
 *      (or a Login link) right. The email label is hidden < md.
 *   4. 768+: the email label appears (hidden md:inline); layout otherwise unchanged.
 *   Touch targets: avatar trigger + theme button meet 44px on touch (Gate-4 floor).
 */
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
                <DropdownMenuTrigger className="cursor-pointer inline-flex items-center justify-center pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                  <Avatar>
                    <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover text-popover-foreground">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="pointer-coarse:min-h-11">
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
