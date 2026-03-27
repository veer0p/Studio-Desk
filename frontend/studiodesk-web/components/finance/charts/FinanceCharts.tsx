"use client"

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts"

const monthlyData = [
  { name: 'May', revenue: 400000, expenses: 240000 },
  { name: 'Jun', revenue: 300000, expenses: 139800 },
  { name: 'Jul', revenue: 200000, expenses: 98000 },
  { name: 'Aug', revenue: 278000, expenses: 190800 },
  { name: 'Sep', revenue: 189000, expenses: 48000 },
  { name: 'Oct', revenue: 239000, expenses: 38000 },
]

const expenseData = [
  { name: 'Equipment', value: 85000 },
  { name: 'Freelancers', value: 120000 },
  { name: 'Studio Rent', value: 45000 },
  { name: 'Software', value: 30000 },
  { name: 'Travel', value: 15000 },
]

// Artisan UI specific harmonized colors
const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#64748b']

export function FinanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      
      {/* Revenue vs Expenses Bar Chart */}
      <div className="lg:col-span-2 bg-card rounded-xl border border-border/60 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-foreground tracking-tight">Financial Overview</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">Last 6 Months</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Donut Chart */}
      <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm">
        <h3 className="font-semibold text-foreground tracking-tight mb-2">Expense Distribution</h3>
        <p className="text-xs text-muted-foreground mb-6">Current Month (Oct)</p>
        
        <div className="h-[220px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => `₹${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} 
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner Donut Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Total</span>
            <span className="font-bold text-foreground text-lg">₹2.95L</span>
          </div>
        </div>

        {/* Custom Legend for Donut */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {expenseData.slice(0, 4).map((entry, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
              <span className="truncate">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
