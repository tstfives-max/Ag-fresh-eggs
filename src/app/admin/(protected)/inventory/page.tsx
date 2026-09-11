import { InventoryManager } from "./InventoryManager";

export default function AdminInventoryPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-bold text-foreground">Inventory</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Leave stock qty blank for unlimited. Sold-out packs are hidden from checkout automatically.
      </p>
      <div className="mt-4">
        <InventoryManager />
      </div>
    </div>
  );
}
