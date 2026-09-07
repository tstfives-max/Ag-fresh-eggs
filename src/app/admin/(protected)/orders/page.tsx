import { OrdersTable } from "./OrdersTable";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-bold text-foreground">Orders</h1>
      <div className="mt-4">
        <OrdersTable />
      </div>
    </div>
  );
}
