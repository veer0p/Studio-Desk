"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, DownloadCloud } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export function DangerSettings() {
  const [delBookOpen, setDelBookOpen] = useState(false)
  const [delAccOpen, setDelAccOpen] = useState(false)

  const [bookConfirmStr, setBookConfirmStr] = useState("")
  const [accConfirmStr, setAccConfirmStr] = useState("")
  const [accPassStr, setAccPassStr] = useState("")

  return (
    <div className="space-y-8">
      <div className="mb-8 border-b border-red-500/20 pb-4">
        <div className="flex items-center gap-3 text-red-600 mb-1">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-tight">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-600/70 ml-9">Use extreme caution. These actions cannot be undone without contacting enterprise support directly.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-3xl">

        {/* Export Data */}
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-semibold text-foreground">Export Studio Data</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Downloads a ZIP archive containing <code>clients.csv</code>, <code>bookings.csv</code>, <code>invoices.csv</code>, and complete gallery metadata. This takes a few minutes to process safely.
            </p>
          </div>
           <Button className="shrink-0 max-md:self-start bg-primary text-primary-foreground"><DownloadCloud className="w-4 h-4 mr-2" /> Download All Data</Button>
        </div>

        {/* Delete Bookings */}
        <div className="bg-card border border-red-500/20 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h3 className="font-semibold text-foreground">Purge All Bookings</h3>
             <p className="text-sm text-muted-foreground mt-1 max-w-lg">
               This will permanently delete all shoots, proposals, and signed contracts. <strong>Client CRM records will remain intact.</strong>
             </p>
          </div>
          <Button variant="destructive" className="shrink-0 max-md:self-start bg-red-600 hover:bg-red-700 text-white" onClick={() => setDelBookOpen(true)}>Delete Bookings</Button>
        </div>

        {/* Erase Account */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h3 className="font-semibold text-red-700">Erase StudioDesk Account</h3>
             <p className="text-sm text-red-600/80 mt-1 max-w-lg">
               Irreversibly deletes the entire studio architecture, mapping all active storage links offline immediately wiping everything from caching bounds eternally without fail.
             </p>
          </div>
          <Button variant="destructive" className="shrink-0 max-md:self-start bg-red-600 hover:bg-red-700 text-white" onClick={() => setDelAccOpen(true)}>Delete My Studio</Button>
        </div>

      </div>

      {/* Delete Bookings Dialog */}
      <Dialog open={delBookOpen} onOpenChange={setDelBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Are you absolutely sure?</DialogTitle>
            <DialogDescription className="pt-2">
              This action <strong>cannot</strong> be undone. This will permanently strip the bookings tree dropping all active financial constraints synchronously globally.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm">Please type <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">DELETE BOOKINGS</code> to verify.</p>
            <Input 
              value={bookConfirmStr} 
              onChange={e => setBookConfirmStr(e.target.value)} 
              placeholder="DELETE BOOKINGS"
              className="border-red-500/30 focus-visible:ring-red-500/20"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDelBookOpen(false)}>Cancel Drop</Button>
            <Button variant="destructive" disabled={bookConfirmStr !== "DELETE BOOKINGS"} className="bg-red-600 hover:bg-red-700">I understand, delete bookings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={delAccOpen} onOpenChange={setDelAccOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Erase Entire Studio Structure?</DialogTitle>
            <DialogDescription className="pt-2">
              This permanently deletes your studio, all data, <strong>all client records</strong>, all galleries, and cannot be undone. You will lose access to the platform instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <p className="text-sm">Please type <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">StudioDesk Defaults</code> to confirm.</p>
               <Input 
                  value={accConfirmStr} 
                  onChange={e => setAccConfirmStr(e.target.value)} 
                  placeholder="Studio Name exactly"
                  className="border-red-500/30 focus-visible:ring-red-500/20"
                />
            </div>
             <div className="space-y-2">
              <p className="text-sm">Enter your Password *</p>
               <Input 
                  type="password"
                  value={accPassStr} 
                  onChange={e => setAccPassStr(e.target.value)} 
                  placeholder="••••••••••••••••"
                  className="border-red-500/30 focus-visible:ring-red-500/20"
                />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDelAccOpen(false)}>Cancel Deletion</Button>
            <Button variant="destructive" disabled={accConfirmStr !== "StudioDesk Defaults" || !accPassStr} className="bg-red-600 hover:bg-red-700">Permanently Remove Studio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
