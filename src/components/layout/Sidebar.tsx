/**
 * Sidebar — member portal navigation (command palette: search + Dashboard + Profile).
 *
 * Pre-Write Check:
 *   1. Primitives: Command (cmdk) — CommandInput/List/Group/Item; next/link.
 *   2. Manual ref: COMPONENT_REGISTRY (Sidebar); FFM 13.1 Gate M.
 *   3. 375 sketch: rendered inside AppShellPage's mobile drawer (left Sheet) — a
 *      full-height searchable command list, one tap per destination.
 *   4. >= xl (1280): the same list becomes the persistent 25rem rail.
 *   Touch targets: CommandItem rows are list-height tap targets.
 */
import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { LayoutDashboard, User } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  return (
    <Command className="bg-secondary">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="px-8">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <Link href="/members-portal">Dashboard</Link>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <Link href="/profile">Profile</Link>
            <CommandShortcut>&#x2318; P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default Sidebar;
