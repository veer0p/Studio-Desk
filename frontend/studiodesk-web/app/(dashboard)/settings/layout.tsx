import { SettingsShell } from "@/components/settings/SettingsShell"

export const metadata = {
  title: "Settings & Configuration | StudioDesk",
  description: "Manage your studio identity, financial limits, and automated webhooks.",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  // Wrap all sub-routes transparently inside the global structural sidebar
  return <SettingsShell>{children}</SettingsShell>
}
