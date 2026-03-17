"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";

export interface LineItem {
  id: string;
  name: string;
  description: string;
  hsn: string;
  qty: number;
  unit_price: number;
}

interface ProposalLineItemRowProps {
  item: LineItem;
  onChange: (item: LineItem) => void;
  onRemove: () => void;
  index: number;
}

export function ProposalLineItemRow({ item, onChange, onRemove, index }: ProposalLineItemRowProps) {
  const [displayPrice, setDisplayPrice] = useState("");

  useEffect(() => {
    setDisplayPrice(formatCurrency(item.unit_price));
  }, [item.unit_price]);

  const handlePriceFocus = () => {
    setDisplayPrice(item.unit_price.toString());
  };

  const handlePriceBlur = () => {
    const numericValue = parseFloat(displayPrice.replace(/[^0-9.]/g, ""));
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    onChange({ ...item, unit_price: finalValue });
    setDisplayPrice(formatCurrency(finalValue));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayPrice(e.target.value);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const total = item.qty * item.unit_price;

  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl group transition-all hover:border-slate-300 shadow-sm">
      <div className="mt-2.5 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 space-y-1.5">
          <Input
            placeholder="Item name (e.g. Wedding Photography)"
            value={item.name}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
            className="font-bold border-transparent focus:border-slate-200 bg-slate-50/50"
          />
          <Input
            placeholder="Description (optional)"
            value={item.description}
            onChange={(e) => onChange({ ...item, description: e.target.value })}
            className="text-xs h-8 border-transparent focus:border-slate-200 bg-slate-50/50 text-slate-500"
          />
        </div>

        <div className="col-span-4 md:col-span-1">
          <Input
            placeholder="HSN"
            value={item.hsn}
            onChange={(e) => onChange({ ...item, hsn: e.target.value })}
            className="text-center text-xs h-10 border-slate-200"
          />
        </div>

        <div className="col-span-4 md:col-span-1">
          <Input
            type="number"
            step="0.5"
            min="0.5"
            value={item.qty}
            onChange={(e) => onChange({ ...item, qty: parseFloat(e.target.value) || 0 })}
            className="text-center font-medium border-slate-200"
          />
        </div>

        <div className="col-span-4 md:col-span-3">
          <Input
            value={displayPrice}
            onFocus={handlePriceFocus}
            onBlur={handlePriceBlur}
            onChange={handlePriceChange}
            className="text-right font-medium border-slate-200"
          />
        </div>

        <div className="col-span-10 md:col-span-2 flex items-center justify-end pr-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
            <div className="text-sm font-bold text-slate-900">{formatCurrency(total)}</div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-10 w-10 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
