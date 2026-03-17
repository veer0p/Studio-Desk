"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';

const data = [
  { name: 'Wedding', value: 45, color: '#f43f5e' },
  { name: 'Corporate', value: 25, color: '#3b82f6' },
  { name: 'Portrait', value: 15, color: '#a855f7' },
  { name: 'Pre-Wedding', value: 10, color: '#ec4899' },
  { name: 'Other', value: 5, color: '#94a3b8' },
];

export function EventTypeChart() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
      <div className="h-[250px] w-full md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{payload[0].name}</p>
                      <p className="text-sm font-black text-slate-900">{payload[0].value}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-400">{item.value}%</span>
               <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
