import { Suspense } from "react"
import { FinanceShell } from "@/components/finance/FinanceShell"
import { InvoiceList } from "@/components/finance/invoices/InvoiceList"
import { PaymentList } from "@/components/finance/payments/PaymentList"
import { ExpenseList } from "@/components/finance/expenses/ExpenseList"
import { FinanceCharts } from "@/components/finance/charts/FinanceCharts"

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
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading Finance DB...</div>}>
      <FinanceShell>
        {currentTab === "invoices" && <InvoiceList />}
        {currentTab === "payments" && <PaymentList />}
        {currentTab === "expenses" && <ExpenseList />}
        
        {/* Global Analytics Footer */}
        <FinanceCharts />
      </FinanceShell>
    </Suspense>
  )
}