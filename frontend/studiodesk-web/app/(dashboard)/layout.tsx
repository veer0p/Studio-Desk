export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen overflow-hidden"><aside className="w-64 bg-sidebar text-sidebarForeground p-4 hidden md:block">Sidebar Placeholder</aside><main className="flex-1 overflow-auto bg-background p-4">{children}</main></div>
}