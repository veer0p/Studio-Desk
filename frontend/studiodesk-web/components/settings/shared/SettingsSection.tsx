export function SettingsSection({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) {
  return (
    <div className="py-8 border-b border-border/40 last:border-0 -mx-6 px-6 md:-mx-8 md:px-8">
      <div className="mb-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="space-y-6 max-w-2xl">
        {children}
      </div>
    </div>
  )
}
