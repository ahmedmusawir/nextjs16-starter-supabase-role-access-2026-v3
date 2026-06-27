/**
 * NavbarLoginReg — minimal top bar for the auth pages (logo + theme only).
 *
 * Pre-Write Check:
 *   1. Primitives: next/link; ThemeToggle.
 *   2. Manual ref: COMPONENT_REGISTRY (Navbar variants).
 *   3. 375 sketch: full-width nav-token bar — logo left, ThemeToggle right.
 *   4. 768/1024: no responsive change (single-row bar at every width).
 *   Touch targets: ThemeToggle meets 44px on touch (Gate-4 floor).
 */
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const NavbarLoginReg = () => {
  return (
    <div className="bg-nav-bg text-nav-foreground py-2 px-5 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg tracking-tight">
        Starter Kit
      </Link>
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default NavbarLoginReg;
