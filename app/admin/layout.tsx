import { verifyAuth } from "@/lib/utils/auth";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth status but don't redirect here - proxy handles that
  // We just use it to conditionally render the nav
  const auth = await verifyAuth();

  // If not authenticated, just render children (login page will be one of them)
  // Proxy ensures only login page is accessible when not authenticated
  if (!auth) {
    return <>{children}</>;
  }

  // If authenticated, render the full layout with sidebar
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarRail />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
