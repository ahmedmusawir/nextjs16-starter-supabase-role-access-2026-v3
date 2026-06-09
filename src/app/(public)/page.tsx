import Link from "next/link";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Box from "@/components/common/Box";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <Page FULL={false} className="">
      {/* Hero — transforms split at lg (1024), not md (L18) */}
      <Row className="text-center py-12 lg:py-24">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Your Product
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A neutral starter for what you're building next. Token-driven UI,
          three-tier RBAC out of the box, dark mode that actually reads.
        </p>
        <div className="mt-8 flex flex-col lg:flex-row gap-3 justify-center items-center">
          <Button asChild>
            <Link href="/auth">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/members-portal">Explore the portals</Link>
          </Button>
        </div>
      </Row>

      {/* Trust row */}
      <Row className="border-t border-border py-10">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm text-muted-foreground">
          <span>Built on Next.js + Supabase</span>
          <span aria-hidden>·</span>
          <span>Token-driven design system</span>
          <span aria-hidden>·</span>
          <span>Tested 81/81</span>
        </div>
      </Row>

      {/* Feature grid */}
      <Row className="py-12 lg:py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-10">
          What ships in v3
        </h2>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Box className="rounded-lg border border-border bg-card text-card-foreground p-6">
            <h3 className="text-lg font-semibold mb-2">Role-based access</h3>
            <p className="text-sm text-muted-foreground">
              Three-tier RBAC (superadmin / admin / member) wired end-to-end
              with redirect-on-click route guards via `protectPage`.
            </p>
          </Box>
          <Box className="rounded-lg border border-border bg-card text-card-foreground p-6">
            <h3 className="text-lg font-semibold mb-2">Token-driven design</h3>
            <p className="text-sm text-muted-foreground">
              Light + dark out of the box. Swap brand values in one file and
              the whole UI re-themes. No numbered Tailwind classes anywhere.
            </p>
          </Box>
          <Box className="rounded-lg border border-border bg-card text-card-foreground p-6">
            <h3 className="text-lg font-semibold mb-2">Build-safe</h3>
            <p className="text-sm text-muted-foreground">
              Cold build passes with no env present. Client components defer
              auth client creation so static prerender never breaks.
            </p>
          </Box>
        </div>
      </Row>

      {/* Footer CTA */}
      <Row className="border-t border-border py-12 lg:py-16 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-3">
          Ready to ship?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Clone, swap the brand tokens, and start building.
        </p>
        <Button asChild>
          <Link href="/auth">Sign in</Link>
        </Button>
      </Row>
    </Page>
  );
};

export default HomePage;
