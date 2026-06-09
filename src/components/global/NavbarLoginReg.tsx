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
