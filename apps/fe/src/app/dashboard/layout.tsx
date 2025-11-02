'use client';

import { SidebarProvider, SidebarInset } from '@dougust/ui';
import { AppSidebar } from '../../components/app-sidebar';
import { Navbar } from '../../components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
