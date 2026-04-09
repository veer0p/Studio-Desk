import { SettingsNav } from "./SettingsNav"

export function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col h-full items-center">
      <div className="w-full max-w-6xl border-b border-border/40 bg-background/95 backdrop-blur shrink-0 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Settings & Configuration</h1>
        <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground mt-2">Studio Defaults • Constraints • Integrations • Tax Mapping</p>
      </div>

      <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row overflow-hidden relative">
        <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border/40 bg-muted/20 p-3 sm:p-4 md:p-6 overflow-x-auto md:overflow-y-auto custom-scrollbar z-10">
          <SettingsNav />
        </aside>
        
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <div className="max-w-3xl p-6 md:p-8 min-h-full pb-32">
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
