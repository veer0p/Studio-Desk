import { ClientAvatar } from "@/components/clients/shared/ClientAvatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { whatsappUrl } from "@/lib/phone"

const formatAmount = (amt: number) => {
  if (!amt) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`
  return `₹${amt}`
}

export default function ClientCard({ client }: { client: any }) {
  const router = useRouter()
  const tags = client.tags || []

  return (
    <div className="flex flex-col bg-card border border-border/60 rounded-md overflow-hidden shadow-none hover:ring-1 hover:ring-foreground/10 transition-all duration-200">
      <div className="p-6 flex flex-col items-center text-center">
        <ClientAvatar name={client.name || "Unknown"} size="lg" className="mb-4" />
        
        <h3 className="font-semibold text-lg line-clamp-1">{client.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{client.city || "No City"}</p>
        
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 w-full h-6">
          {tags.slice(0, 3).map((tag: string, i: number) => (
            <span key={i} className="px-1.5 py-0.5 rounded-sm bg-muted border border-border/40 text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">+{tags.length - 3}</span>
          )}
        </div>
      </div>

      <div className="border-t border-border/40" />

      <div className="grid grid-cols-3 divide-x divide-border/40 p-3 sm:p-4 shrink-0 text-center">
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase text-muted-foreground mb-1">Bookings</span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-foreground">{client.bookingsCount || 0}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase text-muted-foreground mb-1">Spend</span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-foreground">{formatAmount(client.totalSpend)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase text-muted-foreground mb-1">Last Seen</span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-muted-foreground">{client.lastBookingDate || "Never"}</span>
        </div>
      </div>

      <div className="border-t border-border/40" />

      <div className="grid grid-cols-2 p-2 gap-2 bg-muted/5 border-t border-border/40">
        {(() => {
          const wa = whatsappUrl(client.phone)
          return wa ? (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-[10px] sm:text-[11px] font-mono uppercase tracking-wider sm:tracking-widest px-2 sm:px-4"
              asChild
            >
              <a href={wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-muted-foreground/40 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider sm:tracking-widest cursor-default"
              disabled
            >
              No WhatsApp
            </Button>
          )
        })()}
        <Button
          variant="ghost" 
          className="text-foreground text-[11px] font-mono uppercase tracking-widest"
          onClick={() => router.push(`/clients/${client.id}`)}
        >
          View Profile
        </Button>
      </div>
    </div>
  )
}
