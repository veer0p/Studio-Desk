"use client"

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function GSTBreakdown({ 
  subtotal, 
  gstType, 
  gstRate = 18 
}: { 
  subtotal: number, 
  gstType: "cgst_sgst" | "igst", 
  gstRate?: number 
}) {
  const taxAmount = (subtotal * gstRate) / 100
  const total = subtotal + taxAmount

  return (
    <div className="w-full max-w-sm ml-auto space-y-2 text-sm">
      
      {/* Dynamic Render based on State alignment */}
      {gstType === "cgst_sgst" ? (
        <>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>CGST ({gstRate / 2}%)</span>
            <span className="font-mono">{formatINR(taxAmount / 2)}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>SGST ({gstRate / 2}%)</span>
            <span className="font-mono">{formatINR(taxAmount / 2)}</span>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center text-muted-foreground">
          <span>IGST ({gstRate}%)</span>
          <span className="font-mono">{formatINR(taxAmount)}</span>
        </div>
      )}

      {/* Aggregate */}
      <div className="flex justify-between items-center pt-2">
        <span className="font-medium text-foreground">Subtotal</span>
        <span className="font-mono font-medium">{formatINR(subtotal)}</span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-muted-foreground">Total Tax</span>
        <span className="font-mono text-muted-foreground">{formatINR(taxAmount)}</span>
      </div>

      <div className="w-full h-px bg-border/60 my-2"></div>

      <div className="flex justify-between items-center text-base">
        <span className="font-bold text-foreground">Total</span>
        <span className="font-mono font-bold tracking-tight text-foreground">{formatINR(total)}</span>
      </div>

    </div>
  )
}
