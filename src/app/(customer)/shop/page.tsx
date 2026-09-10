import { ProductCard } from "@/components/product/ProductCard";
import {
  getActiveProducts,
  isSoldOut,
  isLowStock,
  effectivePrice,
  categoryFor,
  CATEGORY_LABELS,
  type ProductCategory,
} from "@/lib/services/products";

export const revalidate = 0;
export const metadata = { title: "Shop — AG Fresh Eggs" };

export default async function ShopPage() {
  const products = await getActiveProducts();

  const byCategory = new Map<ProductCategory, typeof products>();
  for (const product of products) {
    const cat = categoryFor(product);
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), product]);
  }

  const order: ProductCategory[] = ["popular", "small", "family", "bulk"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Shop Fresh Eggs</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Simple packs, fresh delivery — within 3 KM of Danapur.
      </p>

      {order
        .filter((cat) => byCategory.has(cat))
        .map((cat) => (
          <section key={cat} className="mt-8">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {byCategory.get(cat)!.map((product) => (
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
        ))}
    </div>
  );
}
