import { ProductsManager } from "./ProductsManager";

export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-bold text-foreground">Products &amp; Prices</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Changes take effect on the customer app immediately — no redeploy needed.
      </p>
      <div className="mt-4">
        <ProductsManager />
      </div>
    </div>
  );
}
