'use client';

import { SidebarInset, SidebarProvider } from '@dougust/ui';
import { AppSidebar, Navbar } from '../../components';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true} className="h-full">
      <AppSidebar />
      <SidebarInset className="h-full">
        <Navbar />
        <div className="flex flex-col gap-4 p-4 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
