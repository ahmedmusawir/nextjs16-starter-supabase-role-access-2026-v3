/**
 * Page — content-flow page wrapper. FULL=true -> full-bleed; FULL=false -> w-11/12
 * centered. Optional customYMargin (default my-10). Not for app shells (use AppShellPage).
 *
 * Pre-Write Check:
 *   1. Primitives: raw <section> (layout primitive; pairs with Row/Box).
 *   2. Manual ref: COMPONENT_REGISTRY (Page); UI-UX Page Building Pattern.
 *   3. 375 sketch: a single centered column at 11/12 width (or full-bleed), my-10.
 *   4. 768/1024: width holds at 11/12 (the xl:w-4/5 step is currently commented out);
 *      the caller adds responsive grids/flex inside.
 *   Touch targets: N/A (non-interactive layout wrapper).
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  FULL: boolean;
  className?: string;
  customYMargin?: string;
}

function Page({ children, className, FULL, customYMargin }: Props) {
  return (
    <>
      {FULL && (
        <section
          className={`min-h-full min-w-full ${
            customYMargin ? customYMargin : "my-10"
          } ${className}`}
        >
          {children ? children : "This is a Page container. Must have children"}
        </section>
      )}
      {!FULL && (
        <section
          // className={`min-h-full w-11/12 xl:w-4/5 mx-auto ${
          className={`min-h-full w-11/12 mx-auto  ${
            customYMargin ? customYMargin : "my-10"
          } ${className}`}
        >
          {children ? children : "This is a Page Container. Must have children"}
        </section>
      )}
      {/* LG: 1024+ IS SET TO 91% WIDTH (w-11/12) */}
      {/* XL: 1280+ IS SET TO 80% WIDTH (w-4/5) */}
    </>
  );
}

export default Page;
