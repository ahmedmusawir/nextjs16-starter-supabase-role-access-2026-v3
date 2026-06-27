/**
 * PaginationControls — Prev / "Page X of Y" / Next pager. Client; uses useTransition
 * so navigation is non-blocking (Loader2 shows while pending).
 *
 * Pre-Write Check:
 *   1. Primitives: Button (outline, sm), lucide Loader2; next/navigation router.
 *   2. Manual ref: COMPONENT_REGISTRY (PaginationControls).
 *   3. 375 sketch: a single centered row — Prev / status / Next; the end buttons
 *      hide when there is no prev/next page.
 *   4. 768/1024: identical (centered row at every width).
 *   Touch targets: Prev/Next are size="sm" (h-9/36px) -> raised to 44px on touch by
 *      the Gate-4 Button floor.
 */
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  baseUrl: string;
}

const PaginationControls = ({ page, totalPages, baseUrl }: PaginationControlsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigateToPage = (targetPage: number) => {
    startTransition(() => {
      router.push(`${baseUrl}?page=${targetPage}`);
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => navigateToPage(page - 1)}
        >
          Previous
        </Button>
      )}
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => navigateToPage(page + 1)}
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default PaginationControls;
