import { Suspense } from "react"
import { FinanceShell } from "@/components/finance/FinanceShell"
import { InvoiceList } from "@/components/finance/invoices/InvoiceList"
import { PaymentList } from "@/components/finance/payments/PaymentList"
import { ExpenseList } from "@/components/finance/expenses/ExpenseList"
import { FinanceCharts } from "@/components/finance/charts/FinanceCharts"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Finance | StudioDesk",
  description: "Track revenues, payments, and expenses in one spot.",
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const currentTab = params.tab || "invoices"

  return (
    <FinanceShell>
      <div className="space-y-8">
        <Suspense fallback={
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
          </div>
        }>
          {currentTab === "invoices" && <InvoiceList />}
          {currentTab === "payments" && <PaymentList />}
          {currentTab === "expenses" && <ExpenseList />}
        </Suspense>
        
        {/* Global Analytics Footer */}
        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-md" />}>
           <FinanceCharts />
        </Suspense>
      </div>
    </FinanceShell>
  )
}