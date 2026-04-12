"use client"

import { useState, useCallback } from "react"
import useSWR, { mutate } from "swr"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FreelancerPayment,
  FreelancerPaymentsResult,
  fetchFreelancerPayments,
  createFreelancerPayment,
  updateFreelancerPayment,
  deleteFreelancerPayment,
  TeamMember,
  fetchTeamMembers,
} from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Trash2, IndianRupee, CalendarDays, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

const createSchema = z.object({
  member_id: z.string().uuid("Please select a team member"),
  assignment_id: z.string().uuid("Please select an assignment"),
  booking_id: z.string().uuid("Please select a booking"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  payment_method: z.enum(["upi", "cash", "neft", "rtgs", "net_banking", "card", "cheque", "wallet", "other"]).optional(),
  notes: z.string().optional().nullable(),
})

type CreateFormData = z.infer<typeof createSchema>

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  try {
    return format(new Date(dateStr), "dd MMM yyyy")
  } catch {
    return dateStr
  }
}

function StatusBadge({ status }: { status: FreelancerPayment["status"] }) {
  const variants: Record<FreelancerPayment["status"], string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    captured: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    refunded: "bg-red-500/10 text-red-600 border-red-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
  }

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-mono tracking-widest uppercase rounded-sm ${variants[status]}`}
    >
      {status}
    </Badge>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof IndianRupee | typeof CalendarDays
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-md border border-border/60 bg-muted/20 ${accent ?? ""}`}>
      <div className="p-2 rounded-sm bg-muted/40 border border-border/40">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{label}</p>
        <p className="text-lg font-bold font-mono tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function PaymentRow({
  payment,
  onStatusChange,
  onDelete,
}: {
  payment: FreelancerPayment
  onStatusChange: (id: string, status: FreelancerPayment["status"]) => void
  onDelete: (id: string) => void
}) {
  const memberName = payment.studio_members?.full_name ?? "Unknown"
  const bookingClient = payment.bookings?.client_name

  return (
    <div
      className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 items-center border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors"
    >
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm text-foreground truncate">{memberName}</span>
        {bookingClient && (
          <span className="text-[10px] text-muted-foreground truncate">
            {bookingClient}
          </span>
        )}
      </div>

      <div className="text-[10px] font-mono text-muted-foreground">
        <span className="truncate" title={payment.booking_id}>
          {payment.booking_id.slice(0, 8)}...
        </span>
      </div>

      <div className="font-mono text-sm font-semibold text-foreground">
        {formatCurrency(Number(payment.amount))}
      </div>

      <div className="text-xs text-muted-foreground">
        {payment.payment_method ? (
          <span className="uppercase text-[10px] font-mono tracking-wider">{payment.payment_method}</span>
        ) : (
          "—"
        )}
      </div>

      <div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {payment.status !== "processing" && payment.status !== "captured" && (
              <DropdownMenuItem onClick={() => onStatusChange(payment.id, "processing")}>
                Mark Processing
              </DropdownMenuItem>
            )}
            {payment.status !== "captured" && (
              <DropdownMenuItem onClick={() => onStatusChange(payment.id, "captured")}>
                Mark Captured
              </DropdownMenuItem>
            )}
            {payment.status !== "refunded" && payment.status !== "failed" && (
              <DropdownMenuItem onClick={() => onStatusChange(payment.id, "refunded")}>
                Mark Refunded
              </DropdownMenuItem>
            )}
            {payment.status !== "captured" && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(payment.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function CreatePaymentDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: membersData } = useSWR<{ list: TeamMember[] }>(
    open ? "/api/v1/team" : null,
    fetchTeamMembers,
    { revalidateOnFocus: false }
  )
  const members = membersData?.list ?? []

  const form = useForm<CreateFormData>({
    resolver: zodResolver(createSchema) as any,
    defaultValues: {
      member_id: "",
      assignment_id: "",
      booking_id: "",
      amount: 0,
      payment_method: undefined,
      notes: null,
    },
  })

  const { register, setValue, formState: { errors }, reset } = form

  const onSubmit = async (data: CreateFormData) => {
    setIsSubmitting(true)
    try {
      await createFreelancerPayment(data)
      onCreated()
      reset()
      onClose()
    } catch (err) {
      console.error("Failed to create payment:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Create a new freelancer payment record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Team Member *</Label>
            <Select
              onValueChange={(val) => setValue("member_id", val)}
              key={form.watch("member_id") || "empty"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.member_id && (
              <p className="text-xs text-red-500">{errors.member_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assignment ID *</Label>
            <Input {...register("assignment_id")} placeholder="Shoot assignment UUID" />
            {errors.assignment_id && (
              <p className="text-xs text-red-500">{errors.assignment_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Booking ID *</Label>
            <Input {...register("booking_id")} placeholder="Booking UUID" />
            {errors.booking_id && (
              <p className="text-xs text-red-500">{errors.booking_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" {...register("amount")} placeholder="0" />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Label>Payment Method</Label>
              <Select
                onValueChange={(val) => setValue("payment_method", val as CreateFormData["payment_method"])}
                key={form.watch("payment_method") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="neft">NEFT</SelectItem>
                  <SelectItem value="rtgs">RTGS</SelectItem>
                  <SelectItem value="net_banking">Net Banking</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              {...register("notes")}
              placeholder="Optional notes..."
              className="min-h-[60px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function FreelancerPayments() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  const params = statusFilter !== "all" ? { status: statusFilter as FreelancerPayment["status"] } : undefined
  const swrKey = `/api/v1/freelancer-payments${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`

  const { data, isLoading } = useSWR<FreelancerPaymentsResult>(
    swrKey,
    () => fetchFreelancerPayments(params),
    { revalidateOnFocus: false }
  )

  const payments = data?.payments ?? []
  const summary = data?.summary

  const handleStatusChange = useCallback(
    async (id: string, status: FreelancerPayment["status"]) => {
      try {
        const updateData: {
          status: FreelancerPayment["status"]
          paid_at?: string | null
        } = { status }
        if (status === "captured") {
          updateData.paid_at = new Date().toISOString().split("T")[0]
        }
        await updateFreelancerPayment(id, updateData)
        mutate((key) => typeof key === "string" && key.startsWith("/api/v1/freelancer-payments"))
      } catch (err) {
        console.error("Failed to update payment status:", err)
      }
    },
    []
  )

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this payment record? This cannot be undone.")) return
    try {
      await deleteFreelancerPayment(id)
      mutate((key) => typeof key === "string" && key.startsWith("/api/v1/freelancer-payments"))
    } catch (err) {
      console.error("Failed to delete payment:", err)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Freelancer Payments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage payouts to your team members.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Bar */}
      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard
            icon={IndianRupee}
            label="Pending Amount"
            value={formatCurrency(summary.total_pending)}
          />
          <SummaryCard
            icon={IndianRupee}
            label="Captured This Month"
            value={formatCurrency(summary.total_paid_this_month)}
          />
          <SummaryCard
            icon={CalendarDays}
            label="Outstanding"
            value={`${summary.overdue_count} record${summary.overdue_count !== 1 ? "s" : ""}`}
            accent={summary.overdue_count > 0 ? "border-red-500/20" : ""}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 bg-muted/30 border-b border-border/60">
          {["Member", "Booking Ref", "Amount", "Method", "Status", ""].map((h) => (
            <div
              key={h}
              className="text-[10px] font-mono tracking-widest uppercase font-bold text-muted-foreground"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {isLoading && (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-sm" />
            ))}
          </div>
        )}

        {!isLoading && payments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No payment records found.</p>
            <p className="text-xs mt-1">Click &ldquo;Record Payment&rdquo; to add one.</p>
          </div>
        )}

        {!isLoading &&
          payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
      </div>

      {/* Create Dialog */}
      <CreatePaymentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => mutate((key) => typeof key === "string" && key.startsWith("/api/v1/freelancer-payments"))}
      />
    </div>
  )
}
