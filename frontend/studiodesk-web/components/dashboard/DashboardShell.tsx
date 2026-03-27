import React from "react"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full p-4 md:p-8 max-w-[1600px] mx-auto">
      {children}
    </div>
  )
}
