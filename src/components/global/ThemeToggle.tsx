/**
 * ThemeToggle — light/dark/system switcher (next-themes), shown in every navbar.
 *
 * Pre-Write Check:
 *   1. Primitives: Button (ghost), DropdownMenu, next-themes useTheme; lucide Sun/Moon.
 *   2. Manual ref: COMPONENT_REGISTRY (ThemeToggle); THEMING_MANUAL.
 *   3. 375 sketch: a single icon button in the nav bar; tapping opens a small
 *      end-aligned menu (Light / Dark / System).
 *   4. 768/1024: identical (icon button + menu at every width).
 *   Touch targets: the icon button meets 44px on touch (Gate-4 inline fix).
 */
"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";

const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={null}
          className="mr-5 p-2 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
