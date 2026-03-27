import { AlertTriangle, UserCheck } from "lucide-react"

export function ScheduleConflicts() {
  const mockConflicts = [
    {
      id: "c-1", member: "Vikram Singh", date: "24 Mar 2026",
      shoot1: { title: "Rohan & Priya Wedding", time: "09:00 AM - 05:00 PM" },
      shoot2: { title: "Mehta Corporate Offsite", time: "02:00 PM - 08:00 PM" }
    }
  ]
  
  if (mockConflicts.length === 0) {
    return (
      <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-600">
        <UserCheck className="w-5 h-5" />
        <p className="text-sm font-medium">No scheduling conflicts detected for this week. All Clear.</p>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-2 text-amber-600">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="font-semibold">Action Required: Schedule Conflicts ({mockConflicts.length})</h3>
      </div>
      
      {mockConflicts.map(c => (
        <div key={c.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-medium text-amber-900">{c.member} — Double-booked on <span className="font-bold">{c.date}</span></p>
            <div className="text-sm text-amber-700/80 space-y-1 mt-2">
              <p>• Shoot 1: {c.shoot1.title} ({c.shoot1.time})</p>
              <p>• Shoot 2: {c.shoot2.title} ({c.shoot2.time})</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg text-sm transition-colors max-md:self-start">
            Resolve Conflict
          </button>
        </div>
      ))}
    </div>
  )
}
