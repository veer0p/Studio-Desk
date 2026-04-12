import { Suspense } from "react"
import SpreadsheetInvoice from "@/components/finance/SpreadsheetInvoice"
import { Loader2 } from "lucide-react"

export default function NewInvoicePage() {
    return (
        <div className="flex-1 w-full h-full bg-[#0f0f0f] text-[#fafaf9] overflow-hidden flex flex-col">
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
                </div>
            }>
                <SpreadsheetInvoice />
            </Suspense>
        </div>
    )
}
