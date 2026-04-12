import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
      <MarketingNav />
      {/* Narrative Hero */}
      <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
        <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
          Migrate from Excel in <span className="text-[#f59e0b]">minutes.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mt-4">
          We know you have 5 years of client data stuck in spreadsheets. Our onboarding engine imports it instantly.
        </p>
      </section>

      {/* Migration Steps */}
      <section className="py-16 max-w-4xl mx-auto px-6 mb-24 space-y-12">

        <div className="flex gap-6">
          <div className="w-12 h-12 rounded-sm border border-[#f59e0b] text-[#f59e0b] flex items-center justify-center font-mono font-bold text-xl flex-shrink-0">1</div>
          <div>
            <h3 className="font-serif text-2xl text-white mb-2">Upload your `.csv`</h3>
            <p className="text-gray-400">Export your Google Sheets or Excel files as CSV. Upload them directly into the Studio-Desk settings panel. We automatically map columns like "Client Name", "Phone", and "Wedding Date".</p>
            <div className="mt-4 p-4 border border-white/10 bg-[#1A1D27] rounded-sm font-mono text-[10px] text-gray-500 uppercase tracking-widest flex justify-between items-center">
              <span>clients_2025.csv</span>
              <span className="text-[#success]">Mapped: 450 Rows</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-12 h-12 rounded-sm border border-[#f59e0b] text-[#f59e0b] flex items-center justify-center font-mono font-bold text-xl flex-shrink-0">2</div>
          <div>
            <h3 className="font-serif text-2xl text-white mb-2">Connect Razorpay / Cashfree</h3>
            <p className="text-gray-400">Click one button to securely authorize your existing payment gateway. If you don't have one, just paste your studio's UPI VPA (e.g., `studio@icici`).</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-12 h-12 rounded-sm border border-[#success] text-[#success] flex items-center justify-center font-mono font-bold text-xl flex-shrink-0 bg-success/10">3</div>
          <div>
            <h3 className="font-serif text-2xl text-white mb-2">Start sending invoices</h3>
            <p className="text-gray-400">That's it. Your historical data populates your Kanban board, your payments are routed to your bank, and you are ready to send your first automated GST quote via WhatsApp.</p>
            <Button className="mt-6 bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-12 px-8 text-[11px] font-bold">
              Start Migration Now
            </Button>
          </div>
        </div>

      </section>

    </main>
  )
}
