import * as React from "react"
import { Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StatusBadge, EventBadge } from "@/components/shared/status-badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FinancePage() {
    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* 8.1 Summary Banner */}
            <div className="rounded-xl bg-[#1A3C5E] text-white p-5">
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="text-center px-4">
                        <p className="text-2xl font-bold tabular-nums">₹2,40,000</p>
                        <p className="text-sm opacity-70 mt-1">Collected</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-2xl font-bold tabular-nums text-amber-300">₹80,000</p>
                        <p className="text-sm opacity-70 mt-1">Pending</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-2xl font-bold tabular-nums text-red-300">₹59,500</p>
                        <p className="text-sm opacity-70 mt-1">Overdue</p>
                    </div>
                </div>
            </div>

            {/* 8.2 Tab Bar + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b gap-4 pb-0">
                <Tabs defaultValue="all" className="w-full sm:w-auto">
                    <TabsList className="h-10 p-0 bg-transparent gap-6 justify-start w-full sm:w-auto overflow-x-auto rounded-none">
                        <TabsTrigger
                            value="all"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A7EC8] data-[state=active]:text-[#2A7EC8] data-[state=active]:bg-transparent px-0 pb-2.5 pt-2 font-medium"
                        >
                            All Invoices
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A7EC8] data-[state=active]:text-[#2A7EC8] data-[state=active]:bg-transparent px-0 pb-2.5 pt-2 font-medium"
                        >
                            Pending
                        </TabsTrigger>
                        <TabsTrigger
                            value="overdue"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A7EC8] data-[state=active]:text-[#2A7EC8] data-[state=active]:bg-transparent px-0 pb-2.5 pt-2 font-medium"
                        >
                            Overdue
                        </TabsTrigger>
                        <TabsTrigger
                            value="paid"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A7EC8] data-[state=active]:text-[#2A7EC8] data-[state=active]:bg-transparent px-0 pb-2.5 pt-2 font-medium"
                        >
                            Paid
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="pb-2 sm:pb-0 shrink-0">
                    <Select defaultValue="this_month">
                        <SelectTrigger className="h-9 w-[140px] rounded-full text-sm">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                            <SelectItem value="all_time">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 8.3 Invoice Row List */}
            <div className="flex flex-col gap-3">
                {/* Overdue Invoice */}
                <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">INV-FY25-042</span>
                            <span className="text-muted-foreground">·</span>
                            <h3 className="text-sm font-semibold">Sharma Wedding Day 1</h3>
                        </div>
                        <StatusBadge status="overdue" />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>Priya Sharma</span>
                        </div>
                        <EventBadge type="wedding" />
                        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium ml-auto sm:ml-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due 10 Mar 2025</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <span className="text-lg font-bold tabular-nums text-red-600">₹45,000</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-xs h-8 px-3 rounded-full hover:bg-muted">
                                View
                            </Button>
                            <Button variant="outline" className="text-xs h-8 px-4 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                                Send Reminder
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Pending Invoice */}
                <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">INV-FY25-048</span>
                            <span className="text-muted-foreground">·</span>
                            <h3 className="text-sm font-semibold">Reliance Annual Gala</h3>
                        </div>
                        <StatusBadge status="partially_paid" />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>Rahul Desai</span>
                        </div>
                        <EventBadge type="corporate" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto sm:ml-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due 20 Mar 2025</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <span className="text-lg font-bold tabular-nums text-amber-600">₹40,000</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-xs h-8 px-3 rounded-full hover:bg-muted">
                                View
                            </Button>
                            <Button className="text-xs h-8 px-4 rounded-full bg-[#2A7EC8] hover:bg-[#1A6DB5] text-white">
                                Payment Link
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Paid Invoice */}
                <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow opacity-90">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">INV-FY25-041</span>
                            <span className="text-muted-foreground">·</span>
                            <h3 className="text-sm font-semibold">Maternity Shoot - Patel</h3>
                        </div>
                        <StatusBadge status="paid" />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>Anika Patel</span>
                        </div>
                        <EventBadge type="portrait" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto sm:ml-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Paid 05 Mar 2025</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <span className="text-lg font-bold tabular-nums text-green-600">₹15,000</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-xs h-8 px-4 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                                View Receipt
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Draft Invoice */}
                <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">DRAFT</span>
                            <span className="text-muted-foreground">·</span>
                            <h3 className="text-sm font-semibold">Pre-Wedding - Verma</h3>
                        </div>
                        <StatusBadge status="draft" />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>Rohan Verma</span>
                        </div>
                        <EventBadge type="pre_wedding" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto sm:ml-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Not sent</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <span className="text-lg font-bold tabular-nums text-muted-foreground">₹25,000</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-xs h-8 px-3 rounded-full hover:bg-muted">
                                Edit
                            </Button>
                            <Button className="text-xs h-8 px-4 rounded-full bg-[#2A7EC8] hover:bg-[#1A6DB5] text-white">
                                Send Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}