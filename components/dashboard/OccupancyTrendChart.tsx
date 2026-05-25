'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OccupancyTrendChartProps {
  data: { month: string; occupancy: number }[];
}

export default function OccupancyTrendChart({ data }: OccupancyTrendChartProps) {
  return (
    <Card className="p-6 h-[400px] flex flex-col justify-between shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col space-y-1 mb-4">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Occupancy Growth</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Historic bed utilization rates percentage (last 6 months)</p>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-500">
            No occupancy history found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#888888', fontSize: 11 }}
              />
              <Tooltip 
                cursor={{ stroke: '#c7d2fe', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-neutral-100 dark:border-zinc-800 shadow-lg space-y-1">
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          Occupancy Rate: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                name="Occupancy" 
                type="monotone"
                dataKey="occupancy" 
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOccupancy)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
