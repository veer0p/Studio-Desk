import * as React from "react"
import {
    AlertCircle,
    MapPin,
    Phone,
    User,
    TrendingUp,
    Clock,
    CalendarCheck,
    CalendarCheck2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { EventBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"

export default function DashboardPage() {
    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className=" mx-auto flex flex-col gap-6">
            {/* 5.1 Greeting Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Good morning, Arjun 👋</h1>
                <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
            </div>

            {/* 5.2 Today's Shoots Section */}
            <div>
                <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                    Today's Shoots
                </h2>
                {/* Horizontal scrollable row */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Static Item */}
                    <div className="min-w-[280px] flex-shrink-0 rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <EventBadge type="wedding" />
                            <span className="text-xs text-muted-foreground">9:00 AM - 10:00 PM</span>
                        </div>
                        <h3 className="text-sm font-semibold leading-tight">Sharma Wedding Day 1</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            <span>Priya Sharma</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">ITC Grand Chola, Chennai</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#2A7EC8]">
                                <Phone className="w-3.5 h-3.5" />
                                <span>+91 98765 43210</span>
                            </div>
                            <Button variant="outline" className="rounded-full text-xs h-7 px-3 py-1">
                                View Brief
                            </Button>
                        </div>
                    </div>

                    <div className="min-w-[280px] flex-shrink-0 rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <EventBadge type="portrait" />
                            <span className="text-xs text-muted-foreground">2:00 PM - 5:00 PM</span>
                        </div>
                        <h3 className="text-sm font-semibold leading-tight">Maternity Shoot - Kapoor</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            <span>Ankit Kapoor</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">Studio Desk HQ</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#2A7EC8]">
                                <Phone className="w-3.5 h-3.5" />
                                <span>+91 91234 56789</span>
                            </div>
                            <Button variant="outline" className="rounded-full text-xs h-7 px-3 py-1">
                                View Brief
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5.3 Needs Attention Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-semibold">Needs Attention</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">6</span>
                </div>
                <div className="rounded-xl border bg-card shadow-sm divide-y">
                    <div className="flex items-center px-5 py-4 hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <div className="flex-1 ml-3">
                            <p className="text-sm font-medium text-foreground">3 invoices overdue</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Oldest is 5 days overdue</p>
                        </div>
                        <span className="text-xs font-medium text-[#2A7EC8] hover:underline cursor-pointer">View →</span>
                    </div>
                    <div className="flex items-center px-5 py-4 hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <div className="flex-1 ml-3">
                            <p className="text-sm font-medium text-foreground">2 contracts awaiting signature</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Sent 3 days ago</p>
                        </div>
                        <span className="text-xs font-medium text-[#2A7EC8] hover:underline cursor-pointer">View →</span>
                    </div>
                    <div className="flex items-center px-5 py-4 hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <div className="flex-1 ml-3">
                            <p className="text-sm font-medium text-foreground">1 gallery ready to publish</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Sharma Wedding · 450 photos</p>
                        </div>
                        <span className="text-xs font-medium text-[#2A7EC8] hover:underline cursor-pointer">Publish →</span>
                    </div>
                </div>
            </div>

            {/* 5.4 This Month Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Collected</h3>
                    <p className="text-2xl font-bold tabular-nums text-green-600">₹2,40,000</p>
                    <p className="text-sm text-muted-foreground mt-1">This month</p>
                    <div className="flex items-center gap-1.5 mt-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-muted-foreground font-medium">↑ 12% vs last month</span>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Pending</h3>
                    <p className="text-2xl font-bold tabular-nums text-amber-600">₹80,000</p>
                    <p className="text-sm text-muted-foreground mt-1">Outstanding</p>
                    <div className="flex items-center gap-1.5 mt-3">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-muted-foreground font-medium">4 invoices outstanding</span>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Active Bookings</h3>
                    <p className="text-2xl font-bold tabular-nums text-foreground">12</p>
                    <p className="text-sm text-muted-foreground mt-1">In pipeline</p>
                    <div className="flex items-center gap-1.5 mt-3">
                        <CalendarCheck className="w-4 h-4 text-[#2A7EC8]" />
                        <span className="text-xs text-muted-foreground font-medium">8 done · 4 upcoming</span>
                    </div>
                </div>
            </div>

            {/* 5.5 Next 7 Days Timeline */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold mb-4">Next 7 Days</h2>

                {/* Week grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                    <div className="flex flex-col items-center gap-1 py-1">
                        <span className="text-xs text-muted-foreground">Sun</span>
                        <span className="text-sm font-semibold tracking-tight">14</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 bg-[#2A7EC8]/10 rounded-lg py-1 px-1.5">
                        <span className="text-xs text-muted-foreground">Mon</span>
                        <span className="text-sm font-bold text-[#2A7EC8]">15</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2A7EC8] mt-0.5" />
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1">
                        <span className="text-xs text-muted-foreground">Tue</span>
                        <span className="text-sm font-semibold tracking-tight">16</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1">
                        <span className="text-xs text-muted-foreground">Wed</span>
                        <span className="text-sm font-semibold tracking-tight">17</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2A7EC8] mt-0.5" />
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1">
                        <span className="text-xs text-muted-foreground">Thu</span>
                        <span className="text-sm font-semibold tracking-tight">18</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1">
                        <span className="text-xs text-muted-foreground">Fri</span>
                        <span className="text-sm font-semibold tracking-tight">19</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2A7EC8] mt-0.5" />
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1">
                        <span className="text-xs text-muted-foreground">Sat</span>
                        <span className="text-sm font-semibold tracking-tight">20</span>
                    </div>
                </div>

                {/* Divider above list */}
                <div className="h-px bg-border mb-4" />

                {/* Upcoming shoots list */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 text-center shrink-0">
                            <p className="text-lg font-bold">15</p>
                            <p className="text-xs text-muted-foreground">Mon</p>
                        </div>
                        <div className="w-px h-10 bg-border shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">Sharma Wedding Day 1</h4>
                            <p className="text-xs text-muted-foreground truncate">Priya Sharma · 9:00 AM</p>
                        </div>
                        <EventBadge type="wedding" className="shrink-0 hidden sm:inline-flex" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 text-center shrink-0">
                            <p className="text-lg font-bold">17</p>
                            <p className="text-xs text-muted-foreground">Wed</p>
                        </div>
                        <div className="w-px h-10 bg-border shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">Reliance Annual Gala</h4>
                            <p className="text-xs text-muted-foreground truncate">Rahul Desai · 6:00 PM</p>
                        </div>
                        <EventBadge type="corporate" className="shrink-0 hidden sm:inline-flex" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 text-center shrink-0">
                            <p className="text-lg font-bold">19</p>
                            <p className="text-xs text-muted-foreground">Fri</p>
                        </div>
                        <div className="w-px h-10 bg-border shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">Baby Shower - Anika</h4>
                            <p className="text-xs text-muted-foreground truncate">Anika Patel · 10:00 AM</p>
                        </div>
                        <EventBadge type="other" className="shrink-0 hidden sm:inline-flex" />
                    </div>
                </div>
            </div>
        </div>
    )
}