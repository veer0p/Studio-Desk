import { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface DetailLayoutProps {
  /** Back navigation link */
  backLink: string
  /** Accessible label for back button */
  backLabel: string
  /** Page title */
  title: string
  /** Optional status badge text */
  statusBadge?: ReactNode
  /** Optional subtitle (shown below title) */
  subtitle?: ReactNode
  /** Left column content (main details) */
  children: ReactNode
  /** Right column content (summary/sidebar) */
  sidebar?: ReactNode
}

/**
 * Shared layout component for all detail pages.
 * Ensures consistent header, grid, and responsive behavior.
 *
 * Usage:
 *   <DetailLayout
 *     backLink="/leads"
 *     backLabel="Back to leads"
 *     title={data.clientName}
 *     statusBadge={<span>{data.stage}</span>}
 *     subtitle={<span>{data.date}</span>}
 *   >
 *     <div>Left column content</div>
 *     <DetailLayout.Sidebar>Right column content</DetailLayout.Sidebar>
 *   </DetailLayout>
 */
export default function DetailLayout({
  backLink,
  backLabel,
  title,
  statusBadge,
  subtitle,
  children,
  sidebar,
}: DetailLayoutProps) {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link
          href={backLink}
          className="p-2 hover:bg-muted rounded-md transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={backLabel}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {subtitle}
          {statusBadge}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Left - Main Content */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          {children}
        </div>

        {/* Right - Sidebar */}
        {sidebar && (
          <div className="space-y-4">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  )
}
