import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StudioProvider } from "@/providers/studio-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudioProvider>
      <div className="flex min-h-screen bg-slate-50 flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex" />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </StudioProvider>
  );
}
