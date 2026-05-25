'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PaymentStatusDonutProps {
  data: { name: string; value: number; color: string }[];
}

export default function PaymentStatusDonut({ data }: PaymentStatusDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 h-[400px] flex flex-col justify-between shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col space-y-1 mb-4">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Rent Collection Status</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Proportion of students who have fully cleared their dues</p>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
        {total === 0 ? (
          <div className="text-sm text-zinc-500">No active student records</div>
        ) : (
          <>
            {/* Donut Center Total indicator */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100">{total}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">Total Students</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const percentage = ((item.value / total) * 100).toFixed(0);
                      return (
                        <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-neutral-100 dark:border-zinc-800 shadow-md">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                            {item.name}: <span className="font-bold">{item.value} ({percentage}%)</span>
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

      {/* Custom Premium Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {data.map((item, i) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.name}</span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {item.value} <span className="text-[10px] font-normal text-zinc-400">({percentage}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
