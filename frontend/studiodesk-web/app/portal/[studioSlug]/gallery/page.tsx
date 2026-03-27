// app/portal/[studioSlug]/gallery/page.tsx
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Lock } from "lucide-react"

export const metadata = { title: "My Galleries | Client Portal" }

export default function PortalGalleriesPage() {
  const galleries = [
    {
       name: "Priya & Raj - Haldi & Mehndi",
       slug: "priya-raj-haldi",
       photos: 450,
       status: "Published",
       cover: "https://images.unsplash.com/photo-1583939000240-690e16afce1a?q=80&w=800&auto=format&fit=crop"
    },
    {
       name: "Priya & Raj - Grand Reception",
       slug: "priya-raj-reception",
       photos: 1250,
       status: "Processing",
       cover: ""
    }
  ]

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Galleries</h1>
        <p className="text-sm text-muted-foreground mt-1">Access, download, and select your favorite event memories securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galleries.map(g => (
          g.status === 'Published' ? (
             <Link key={g.slug} href={`/gallery/p/${g.slug}`} className="block group">
               <div className="bg-card border border-border/60 hover:border-[hsl(var(--portal-primary))/40] rounded-2xl overflow-hidden shadow-sm transition-all h-full">
                 <div className="w-full h-48 bg-muted relative overflow-hidden">
                   {g.cover && (
                     <Image
                       src={g.cover}
                       alt={g.name}
                       fill
                       sizes="(min-width: 768px) 50vw, 100vw"
                       className="object-cover transition-transform duration-700 group-hover:scale-105"
                     />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                   <div className="absolute bottom-4 left-4 text-white">
                      <span className="text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-0.5 rounded shadow">Unlocked</span>
                   </div>
                 </div>
                 <div className="p-5 flex items-center justify-between">
                   <div>
                     <h3 className="font-bold text-foreground group-hover:text-[hsl(var(--portal-primary))] tracking-tight">{g.name}</h3>
                     <p className="text-sm text-muted-foreground mt-0.5">{g.photos} High-Res Photos</p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-[hsl(var(--portal-primary))] group-hover:text-white transition-colors shrink-0">
                     <ArrowRight className="w-5 h-5" />
                   </div>
                 </div>
               </div>
             </Link>
          ) : (
             <div key={g.slug} className="bg-muted/10 border border-border/40 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col items-center justify-center text-center p-8">
               <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                 <Lock className="w-6 h-6 text-muted-foreground" />
               </div>
               <h3 className="font-bold text-muted-foreground tracking-tight">{g.name}</h3>
               <p className="text-xs font-semibold uppercase tracking-widest text-[#25D366] mt-2 bg-[#25D366]/10 px-3 py-1 rounded-full">Editorial Processing</p>
             </div>
          )
        ))}
      </div>

    </div>
  )
}
