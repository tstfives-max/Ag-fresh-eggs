import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopBar email={session.email} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
