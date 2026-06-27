/**
 * BackButton — consistent back-navigation link (left-arrow icon + label).
 *
 * Pre-Write Check:
 *   1. Primitives: next/link; lucide ArrowLeftCircle.
 *   2. Manual ref: COMPONENT_REGISTRY (BackButton).
 *   3. 375 sketch: an inline muted link (icon + text) above page content; underlines
 *      on hover.
 *   4. 768/1024: identical at every width.
 *   Touch targets: text+icon link, sub-44px tap height; a candidate for the touch
 *      floor if used as a primary mobile control (not bundled in Gate-4 Item 2).
 */
import React from "react";
import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  text: string;
  link: string;
}

const BackButton = ({ text, link }: BackButtonProps) => {
  return (
    <Link
      href={link}
      className="text-muted-foreground hover:underline flex items-center gap-1 font-bold mb-5"
    >
      <ArrowLeftCircle size={18} /> {text}
    </Link>
  );
};

export default BackButton;
