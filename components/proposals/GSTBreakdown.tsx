"use client";

import { Info } from "lucide-react";

export type GstType = "intra" | "inter" | "exempt";

interface GSTBreakdownProps {
  subtotal: number;
  gstType: GstType;
  studioState: string;
  clientState: string | null;
}

export function GSTBreakdown({ subtotal, gstType, studioState, clientState }: GSTBreakdownProps) {
  const isInterState = gstType === "inter" || (gstType === "intra" && clientState && studioState !== clientState);
  const finalGstType = gstType === "exempt" ? "exempt" : isInterState ? "inter" : "intra";

  const cgst = finalGstType === "intra" ? subtotal * 0.09 : 0;
  const sgst = finalGstType === "intra" ? subtotal * 0.09 : 0;
  const igst = finalGstType === "inter" ? subtotal * 0.18 : 0;
  const totalGst = cgst + sgst + igst;
  const grandTotal = subtotal + totalGst;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            <tr className="h-10">
              <td className="text-slate-500">Subtotal</td>
              <td></td>
              <td className="text-right font-medium text-slate-700">{formatCurrency(subtotal)}</td>
            </tr>
            
            {finalGstType === "intra" && (
              <>
                <tr className="h-10">
                  <td className="text-slate-500">CGST (9%)</td>
                  <td className="text-[10px] text-slate-400 font-mono">998389</td>
                  <td className="text-right font-medium text-slate-700">{formatCurrency(cgst)}</td>
                </tr>
                <tr className="h-10">
                  <td className="text-slate-500">SGST (9%)</td>
                  <td className="text-[10px] text-slate-400 font-mono">998389</td>
                  <td className="text-right font-medium text-slate-700">{formatCurrency(sgst)}</td>
                </tr>
              </>
            )}

            {finalGstType === "inter" && (
              <tr className="h-10">
                <td className="text-slate-500">IGST (18%)</td>
                <td className="text-[10px] text-slate-400 font-mono">998389</td>
                <td className="text-right font-medium text-slate-700">{formatCurrency(igst)}</td>
              </tr>
            )}

            {finalGstType === "exempt" && (
              <tr className="h-10">
                <td className="text-slate-500 italic">GST Exempt</td>
                <td></td>
                <td className="text-right font-medium text-slate-400">₹0</td>
              </tr>
            )}

            <tr className="h-14">
              <td className="font-bold text-slate-900 text-base">Grand Total</td>
              <td></td>
              <td className="text-right font-black text-slate-900 text-xl">{formatCurrency(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <Info className="w-3 h-3" />
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {finalGstType === "intra" && "Same state (Maharashtra) → CGST + SGST applies"}
          {finalGstType === "inter" && `Inter-state (${studioState} → ${clientState}) → IGST 18% applies`}
          {finalGstType === "exempt" && "Tax Exempt / Non-GST billing selected"}
        </p>
      </div>
    </div>
  );
}
