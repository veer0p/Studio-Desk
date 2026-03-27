"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, UploadCloud, Trash2 } from "lucide-react"

export function ClientDocuments({ client }: { client: any }) {
  const documents = client.documents || []

  return (
    <div className="space-y-6 pb-10">
      
      {/* Upload Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border border-border/60 rounded-xl p-6 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">Upload File</span>
            <span className="text-xs text-muted-foreground">Contracts, mood boards, or references</span>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 border-dashed border-2">
          Browse Files
        </Button>
      </div>

      {/* Docs Layout */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Saved Documents</h3>
          
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            {documents.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Uploaded</th>
                    <th className="px-4 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.size}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.date}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-muted-foreground hover:text-foreground">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center bg-muted/10 border-dashed border">
                <FileText className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <span className="text-sm font-medium">No documents uploaded</span>
                <span className="text-xs text-muted-foreground">All uploaded files will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
