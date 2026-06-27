/**
 * Main — semantic <main> that fills width and grows (min-w-full flex flex-grow).
 *
 * Pre-Write Check:
 *   1. Primitives: raw <main>.
 *   2. Manual ref: COMPONENT_REGISTRY (Main).
 *   3. 375 sketch: a full-width main region that grows to fill remaining height.
 *   4. 768/1024: no intrinsic change.
 *   Touch targets: N/A (non-interactive layout wrapper).
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className: string;
}

function Main({ children, className }: Props) {
  return (
    <main className={`min-w-full flex flex-grow ${className}`}>{children}</main>
  );
}

export default Main;
