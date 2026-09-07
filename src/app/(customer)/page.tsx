import Link from "next/link";
import { ShieldCheck, Star, IndianRupee } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { getActiveProducts, isSoldOut, isLowStock, effectivePrice } from "@/lib/services/products";
import { BRAND } from "@/lib/constants";

export const revalidate = 0; // always show live prices/stock, never a stale cache

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="ag-fade-up pt-6 pb-8 sm:pt-10 sm:pb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ag-green/10 px-3 py-1 text-xs font-medium text-ag-green">
          <span className="h-1.5 w-1.5 rounded-full bg-ag-green" />
          Delivering within 3 KM of Danapur Canteen
        </span>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Fresh Eggs. Delivered Fast.
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-foreground-muted">
          {BRAND.tagline} — farm-fresh eggs delivered to your doorstep within 3 KM of{" "}
          {BRAND.serviceLocationLabel}.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton href="/shop" size="lg">
            Shop Fresh Eggs
          </LinkButton>
          <LinkButton href="/bulk" variant="outline" size="lg">
            Bulk & Business Orders
          </LinkButton>
        </div>
      </section>

      {/* Popular packs */}
      <section className="pb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Popular Packs</h2>
          <Link href="/shop" className="text-sm font-medium text-ag-green">
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              soldOut={isSoldOut(product)}
              lowStock={isLowStock(product)}
              price={effectivePrice(product, false)}
            />
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="pb-14">
        <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
          Freshness you can count on.
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrustCard
            icon={<ShieldCheck size={18} className="text-ag-green" />}
            title="Fresh every morning"
            body="Every batch is date-stamped so you know exactly how fresh your eggs are."
          />
          <TrustCard
            icon={<Star size={18} className="text-ag-green" />}
            title="Reliable delivery"
            body="Serving homes and businesses within 3 KM of Danapur Canteen, Patna."
          />
          <TrustCard
            icon={<IndianRupee size={18} className="text-ag-green" />}
            title="Easy ordering"
            body="Order in a few taps and get your confirmation instantly on WhatsApp."
          />
        </div>
      </section>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-ag-green/10">
        {icon}
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground-muted">{body}</p>
    </div>
  );
}
