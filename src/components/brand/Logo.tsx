import { cn } from "@/lib/utils/cn";

/**
 * AG Enterprises mark, drawn as inline SVG (two overlapping arches + a leading star,
 * echoing the real logo's green/blue arch motif) so it always renders crisply and
 * themes correctly without depending on an external image asset.
 *
 * Swap this for the real logo file once available: drop it in /public/logo.svg and
 * replace the <svg> below with an <Image> pointing at it — every call site
 * (splash, header, checkout, invoice, admin, AI chat) already renders through here.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AG Enterprises logo"
    >
      <path
        d="M8 30C8 16.7452 18.7452 6 32 6C36.4183 6 40 9.58172 40 14C40 27.2548 29.2548 38 16 38C11.5817 38 8 34.4183 8 30Z"
        fill="var(--ag-green)"
      />
      <path
        d="M16 34C16 22.9543 24.9543 14 36 14C38.2091 14 40 15.7909 40 18C40 29.0457 31.0457 38 20 38C17.7909 38 16 36.2091 16 34Z"
        fill="var(--ag-blue)"
      />
      <path
        d="M39.5 8L40.6 10.9L43.5 12L40.6 13.1L39.5 16L38.4 13.1L35.5 12L38.4 10.9L39.5 8Z"
        fill="var(--ag-green)"
      />
    </svg>
  );
}

export function Logo({
  className,
  markSize = 32,
  showTagline = false,
}: {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-[15px] text-foreground tracking-tight">
          AG Fresh Eggs
        </span>
        <span className="text-[11px] text-foreground-muted -mt-0.5">
          by AG Enterprises
        </span>
        {showTagline && (
          <span className="text-xs text-foreground-muted mt-1">
            Farm Fresh Eggs, Delivered Near You
          </span>
        )}
      </div>
    </div>
  );
}
