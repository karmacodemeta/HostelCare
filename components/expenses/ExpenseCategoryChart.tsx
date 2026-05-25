'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
}

interface ExpenseCategoryChartProps {
  data: CategoryData[];
}

export default function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const COLORS = {
    'Staff': '#4f46e5',
    'Food': '#10b981',
    'Electricity': '#f59e0b',
    'Repair': '#ef4444',
    'Misc': '#64748b',
    'Others': '#8b5cf6'
  };

  const getColor = (name: string) => {
    return (COLORS as any)[name] || '#a855f7';
  };

  return (
    <Card className="p-6 h-[340px] flex flex-col justify-between shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col space-y-1 mb-2">
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-50">Category Distribution</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Expense breakdown by operational department</p>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[180px]">
        {total === 0 ? (
          <div className="text-sm text-zinc-500">No expenses logged in this range</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const percentage = ((item.value / total) * 100).toFixed(0);
                      return (
                        <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-neutral-100 dark:border-zinc-800 shadow-md">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {item.name}: <span className="font-bold">₹{item.value.toLocaleString()} ({percentage}%)</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Grid Legends */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-zinc-800/80">
        {data.slice(0, 6).map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(item.name) }} />
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
