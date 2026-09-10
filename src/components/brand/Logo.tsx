import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import logoSrc from "../../../public/brand/ag-logo.png";

const LOGO_ASPECT = logoSrc.width / logoSrc.height;

/**
 * The real AG Enterprises mark (transparent PNG, trimmed from the source artwork).
 * Every call site (splash, header, checkout, invoice, admin, AI chat) renders through
 * this one component, so a future logo update only needs to touch this file plus
 * public/brand/ag-logo.png.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={logoSrc}
      alt="AG Enterprises logo"
      height={size}
      width={Math.round(size * LOGO_ASPECT)}
      className={cn("h-auto shrink-0 object-contain", className)}
      style={{ height: size, width: "auto" }}
      priority
    />
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
