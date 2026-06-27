/**
 * PublicNavAuthSection — auth-state island for the public nav. Client; reads the
 * Supabase user via createClient() in an effect (prerender-safe, N4).
 *
 * Pre-Write Check:
 *   1. Primitives: Avatar, DropdownMenu, Logout (+ supabase client).
 *   2. Manual ref: COMPONENT_REGISTRY; recon Q11.3 (public routes show auth state).
 *   3. 375 sketch: logged-in -> avatar dropdown (Profile / Logout); logged-out -> a
 *      Login link. Stays top-level (outside any hamburger) at every width.
 *   4. 768+: the email label appears next to the avatar (hidden md:inline).
 *   Touch targets: avatar trigger + Login link meet 44px on touch (Gate-4 floor).
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
import Logout from "../auth/Logout";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const PublicNavAuthSection = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // N4: create the Supabase client inside the effect so this component is
    // prerender-safe (a "use client" component still runs its render body
    // during static prerender SSR, and createClient() needs env at runtime).
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

  if (isLoading) return null;

  if (user) {
    return (
      <>
        <span className="mr-3 text-sm hidden md:inline">{user.email}</span>
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
      </>
    );
  }

  return (
    <Link
      href="/auth"
      className="ml-3 text-sm font-medium hover:underline inline-flex items-center pointer-coarse:min-h-11"
    >
      Login
    </Link>
  );
};

export default PublicNavAuthSection;
