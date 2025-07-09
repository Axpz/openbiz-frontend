import { AppSidebar } from "@/components/app-sidebar"
import { AuthCheck } from "@/components/auth-check"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck requireAdmin>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
    </AuthCheck>
  )
} 