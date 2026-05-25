'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { month: string; revenue: number; expenses: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="p-6 h-[400px] flex flex-col justify-between shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col space-y-1 mb-4">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Financial Trends</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Comparing monthly revenue and operational expenses (last 6 months)</p>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-500">
            No financial history found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#888888', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                tick={{ fill: '#888888', fontSize: 11 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(229, 231, 235, 0.2)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-neutral-100 dark:border-zinc-800 shadow-lg space-y-1">
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          Revenue: ₹{payload[0].value?.toLocaleString()}
                        </p>
                        <p className="text-sm font-bold text-red-500">
                          Expenses: ₹{payload[1].value?.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
              />
              <Bar 
                name="Revenue" 
                dataKey="revenue" 
                fill="url(#colorRevenue)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
              <Bar 
                name="Expenses" 
                dataKey="expenses" 
                fill="url(#colorExpenses)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
