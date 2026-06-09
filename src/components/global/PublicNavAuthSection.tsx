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
      </>
    );
  }

  return (
    <Link href="/auth" className="ml-3 text-sm font-medium hover:underline">
      Login
    </Link>
  );
};

export default PublicNavAuthSection;
