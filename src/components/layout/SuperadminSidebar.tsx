/**
 * SuperadminSidebar — superadmin portal navigation (command palette: Dashboard,
 * Add User).
 *
 * Pre-Write Check:
 *   1. Primitives: Command (cmdk); next/link.
 *   2. Manual ref: COMPONENT_REGISTRY (SuperadminSidebar); FFM 13.1 Gate M.
 *   3. 375 sketch: rendered inside AppShellPage's mobile drawer (left Sheet) — a
 *      full-height searchable command list.
 *   4. >= xl (1280): becomes the persistent 25rem rail.
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
} from "@/components/ui/command";
import { LayoutDashboard, UserPlus } from "lucide-react";
import Link from "next/link";

const SuperadminSidebar = () => {
  return (
    <Command className="bg-secondary">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="px-8">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="User Management">
          <CommandItem>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <Link href="/superadmin-portal">Dashboard</Link>
          </CommandItem>
          <CommandItem>
            <UserPlus className="mr-2 h-4 w-4" />
            <Link href="/superadmin-portal/add-user">Add User</Link>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
      </CommandList>
    </Command>
  );
};

export default SuperadminSidebar;
