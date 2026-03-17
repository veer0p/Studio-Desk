"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

const data = [
  { stage: 'Leads', count: 450, color: '#1a3c5e' },
  { stage: 'Proposals', count: 280, color: '#2a7ec8' },
  { stage: 'Contract', count: 140, color: '#16a085' },
  { stage: 'Payment', count: 110, color: '#10b981' },
];

export function BookingFunnelChart() {
  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 60 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="stage" 
              type="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontBold: 'black', fill: '#1e293b' }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       {payload[0].value} {payload[0].payload.stage}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="count" 
                position="right" 
                style={{ fontSize: 12, fontWeight: 900, fill: '#1e293b' }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
         {[
           { label: "Lead → Proposal", rate: "62%" },
           { label: "Proposal → Contract", rate: "50%" },
           { label: "Contract → Paid", rate: "78%" },
           { label: "Overall Conversion", rate: "24%" }
         ].map(stat => (
           <div key={stat.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 mt-1">{stat.rate}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
