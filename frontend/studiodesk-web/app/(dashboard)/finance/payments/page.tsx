import PaymentCollection from "@/components/finance/PaymentCollection"

export const metadata = {
    title: "Payments | StudioDesk",
    description: "Collect payments seamlessly via UPI",
}

export default function PaymentsPage() {
    return (
        <div className="flex-1 w-full h-full bg-[#0f0f0f] text-[#fafaf9] overflow-hidden flex flex-col">
            <PaymentCollection />
        </div>
    )
}
