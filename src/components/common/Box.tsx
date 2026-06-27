/**
 * Box — the most generic content block (no default styles; fully className-driven).
 * Used for cards, bubbles, grid items.
 *
 * Pre-Write Check:
 *   1. Primitives: raw <div>.
 *   2. Manual ref: COMPONENT_REGISTRY (Box).
 *   3. 375 sketch: whatever the passed className defines; no intrinsic layout.
 *   4. 768/1024: no intrinsic change — responsiveness comes entirely from className.
 *   Touch targets: N/A (non-interactive layout wrapper).
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

function Box({ children, className }: Props) {
  return (
    <div className={`${className}`}>
      {children ? children : "This is a Box container. Must have children"}
    </div>
  );
}

export default Box;
