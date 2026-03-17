"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const dummyData = [
  { name: 'Jan', collected: 45000, pending: 24000 },
  { name: 'Feb', collected: 52000, pending: 18000 },
  { name: 'Mar', collected: 48000, pending: 35000 },
  { name: 'Apr', collected: 71000, pending: 42000 },
  { name: 'May', collected: 65000, pending: 28000 },
  { name: 'Jun', collected: 89000, pending: 55000 },
  { name: 'Jul', collected: 95000, pending: 62000 },
];

export function RevenueChart({ period }: { period: string }) {
  const formatINRShort = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-8">
              <span className="text-xs font-bold text-slate-600">{entry.name}</span>
              <span className="text-sm font-black text-slate-900" style={{ color: entry.color }}>
                ₹{entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dummyData}>
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2a7ec8" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#2a7ec8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickFormatter={formatINRShort}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="collected" 
            name="Collected" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCollected)" 
          />
          <Area 
            type="monotone" 
            dataKey="pending" 
            name="Pending" 
            stroke="#2a7ec8" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPending)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
