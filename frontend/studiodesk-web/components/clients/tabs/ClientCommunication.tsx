"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { logClientCommunication } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Phone, Mail, MessageCircle, FileText, CheckCircle, Clock } from "lucide-react"
import type { ClientDetail, ClientCommunication } from "@/lib/api"

type CommLog = { id: string; type: string; note: string; date: string; user?: string }

export function ClientCommunication({ client }: { client: ClientDetail }) {
  const { mutate } = useSWRConfig()
  const [type, setType] = useState("call_logged")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const logs: CommLog[] = client.communications.map((comm: ClientCommunication) => ({
    id: comm.id,
    type: comm.type,
    note: comm.note ?? comm.notes,
    date: comm.date,
    user: comm.user,
  }))

  const handleLog = async () => {
    if (!note.trim()) {
      toast.error("Please enter a note")
      return
    }

    setIsSubmitting(true)
    try {
      await logClientCommunication(client.id, { type, message: note })
      toast.success("Activity logged")
      setNote("")
      mutate(`/api/v1/clients/${client.id}`)
    } catch (error) {
      toast.error("Failed to log activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getIcon = (logType: string) => {
    switch (logType) {
      case "whatsapp_sent": return <MessageCircle className="w-4 h-4 text-emerald-600" />
      case "email_sent": return <Mail className="w-4 h-4 text-blue-500" />
      case "call_logged": return <Phone className="w-4 h-4 text-indigo-500" />
      case "proposal_sent": return <FileText className="w-4 h-4 text-amber-500" />
      case "contract_signed": return <CheckCircle className="w-4 h-4 text-emerald-500" />
      default: return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      
      {/* Left Column: Log Action */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="font-medium text-sm text-foreground">Log Communication</h3>
        <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm space-y-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type of entry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call_logged">Call logged</SelectItem>
              <SelectItem value="whatsapp_sent">WhatsApp sent</SelectItem>
              <SelectItem value="email_sent">Email sent</SelectItem>
              <SelectItem value="note_added">General note</SelectItem>
            </SelectContent>
          </Select>

          <Textarea 
            placeholder="Details of the conversation..."
            className="h-32 resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Button className="w-full" disabled={isSubmitting} onClick={handleLog}>
            {isSubmitting ? "Logging..." : "Save Entry"}
          </Button>
        </div>
      </div>

      {/* Right Column: Timeline */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-medium text-sm text-foreground">Activity History</h3>
        
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No communication history found.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {logs.map((log, index) => (
                <div key={log.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-slate-500 shadow shrink-0 z-10">
                    {getIcon(log.type)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/40 bg-muted/20 shadow-sm ml-4 md:ml-0 md:group-odd:mr-4">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-medium text-sm text-foreground">{log.type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>
                      <time className="text-xs font-medium text-muted-foreground font-mono">{log.date}</time>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
