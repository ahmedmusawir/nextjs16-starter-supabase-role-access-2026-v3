/**
 * Row — full-width horizontal section with consistent padding (min-w-full p-5).
 *
 * Pre-Write Check:
 *   1. Primitives: raw <div> (layout primitive; holds Box/cards).
 *   2. Manual ref: COMPONENT_REGISTRY (Row).
 *   3. 375 sketch: a full-width padded block; content stacks by default.
 *   4. 768/1024: no intrinsic change — the caller adds responsive flex/grid via
 *      className (e.g. grid-cols-1 md:grid-cols-3).
 *   Touch targets: N/A (non-interactive layout wrapper).
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

function Row({ children, className }: Props) {
  return (
    <div className={`min-w-full p-5 ${className}`}>
      {children ? children : "This is a Row container. Must have children"}
    </div>
  );
}

export default Row;
