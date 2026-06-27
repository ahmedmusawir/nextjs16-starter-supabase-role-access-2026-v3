/**
 * Container — nested-section wrapper (like Page, for sub-sections). FULL=true ->
 * full-bleed; FULL=false -> w-11/12, narrowing to w-4/5 at xl.
 *
 * Pre-Write Check:
 *   1. Primitives: raw <section>.
 *   2. Manual ref: COMPONENT_REGISTRY (Container).
 *   3. 375 sketch: a centered 11/12-width section (non-full).
 *   4. 1280 (xl): narrows to w-4/5; below xl it stays 11/12.
 *   Touch targets: N/A (non-interactive layout wrapper).
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className: string;
  FULL: boolean;
}

function Container({ children, className, FULL }: Props) {
  return (
    <>
      {FULL && (
        <section className={`min-h-full min-w-full ${className}`}>
          {children
            ? children
            : "This is a Container container. Must have children"}
        </section>
      )}
      {!FULL && (
        <section className={`min-h-full w-11/12 xl:w-4/5 mx-auto ${className}`}>
          {children
            ? children
            : "This is a Container container. Must have children"}
        </section>
      )}
      {/* LG: 1024+ IS SET TO 91% WIDTH (w-11/12) */}
      {/* XL: 1280+ IS SET TO 80% WIDTH (w-4/5) */}
    </>
  );
}

export default Container;
