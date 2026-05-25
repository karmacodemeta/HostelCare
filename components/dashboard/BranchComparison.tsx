'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, Building, Landmark, ChevronRight, TrendingUp } from 'lucide-react';

interface BranchData {
  name: string;
  occupiedBeds: number;
  capacity: number;
  collectedRent: number;
  expenses: number;
  netProfit: number;
}

interface BranchComparisonProps {
  data: BranchData[];
}

export default function BranchComparison({ data }: BranchComparisonProps) {
  return (
    <Card className="p-6 shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div className="flex flex-col space-y-0.5">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <Building className="w-5 h-5 text-indigo-500" /> Multi-Branch Comparison
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Live operational and profit metrics side-by-side</p>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
          <Sparkles className="w-3 h-3" /> Branch Analytics Active
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500 italic">
          No branch records found to compare. Add more branches to activate.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {data.map((branch) => {
            const occupancyRate = branch.capacity > 0 ? Math.round((branch.occupiedBeds / branch.capacity) * 100) : 0;
            const isProfitable = branch.netProfit >= 0;

            return (
              <Card 
                key={branch.name} 
                className="p-5 border-neutral-50 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/20 shadow-sm relative overflow-hidden group hover:border-indigo-100 dark:hover:border-zinc-800/80 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50/20 dark:from-indigo-950/5 to-transparent rounded-full pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                      {branch.name}
                    </span>
                    <TrendingUp className={`w-4 h-4 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`} />
                  </div>

                  {/* Bed occupancy progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <span>Beds Allocation</span>
                      <span>{branch.occupiedBeds} / {branch.capacity} ({occupancyRate}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyRate >= 90 
                            ? 'bg-rose-500' 
                            : occupancyRate >= 70 
                              ? 'bg-indigo-600' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Rent Collected</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        ₹{branch.collectedRent?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Expenses Logged</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        ₹{branch.expenses?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Net Profit Banner */}
                  <div className={`p-3 rounded-lg border flex justify-between items-center text-xs font-semibold ${
                    isProfitable 
                      ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30' 
                      : 'bg-rose-50/50 text-rose-700 border-rose-100 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30'
                  }`}>
                    <span>Net Profit / Cash</span>
                    <span className="font-extrabold">
                      {isProfitable ? '+' : ''}₹{branch.netProfit?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}
