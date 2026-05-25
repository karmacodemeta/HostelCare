import { getBranchStats, getDashboardExtendedData, getBranchComparisonData } from '@/app/actions/branch';
import { Card } from '@/components/ui/card';
import { IndianRupee, Users, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import RevenueChart from '@/components/dashboard/RevenueChart';
import PaymentStatusDonut from '@/components/dashboard/PaymentStatusDonut';
import OccupancyCard from '@/components/dashboard/OccupancyCard';
import PendingDuesWidget from '@/components/dashboard/PendingDuesWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import OccupancyTrendChart from '@/components/dashboard/OccupancyTrendChart';
import BranchComparison from '@/components/dashboard/BranchComparison';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const { branch } = await searchParams;
  
  // Parallel server data fetching for speed
  const [stats, extendedData, branchComparison] = await Promise.all([
    getBranchStats(branch),
    getDashboardExtendedData(branch),
    getBranchComparisonData()
  ]);

  const kpis = [
    {
      title: "Total Students",
      value: stats.totalStudents?.toString() ?? "0",
      subtext: `Capacity: ${stats.capacity ?? 0}`,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Rent Collected",
      value: `₹${stats.collectedRent?.toLocaleString() ?? 0}`,
      subtext: `Potential: ₹${stats.totalRent?.toLocaleString() ?? 0}`,
      icon: <IndianRupee className="w-5 h-5" />,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses?.toLocaleString() ?? 0}`,
      subtext: `Operational costs logged`,
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
    },
    {
      title: "Outstanding Dues",
      value: `₹${stats.totalDues?.toLocaleString() ?? 0}`,
      subtext: `Follow up required`,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
    }
  ];

  return (
    <div className="space-y-8 p-1">
      {/* Welcome & Premium Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Dashboard
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Real-time analytics and financial health of your branch.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 border border-indigo-100/50 dark:border-zinc-700/50 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise System Active
        </div>
      </div>

      {/* Modern KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6 hover:shadow-md transition bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-50">
                {kpi.value}
              </span>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {kpi.subtext}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <QuickActions />

      {/* Branch Comparison View */}
      <BranchComparison data={branchComparison} />

      {/* Financial Trends & Rent Donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={extendedData.revenueHistory} />
        </div>
        <div>
          <PaymentStatusDonut data={extendedData.paymentStatus} />
        </div>
      </div>

      {/* Occupancy Trends Area Chart & Occupancy Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OccupancyTrendChart data={extendedData.occupancyHistory} />
        </div>
        <div className="flex flex-col justify-between">
          <OccupancyCard 
            totalStudents={stats.totalStudents} 
            capacity={stats.capacity} 
            totalRooms={stats.totalRooms} 
          />
        </div>
      </div>

      {/* Operations Row: Pending Dues Widget & Activity Feed */}
      <div className="grid gap-6 md:grid-cols-2">
        <PendingDuesWidget 
          students={extendedData.pendingDuesStudents} 
        />
        <ActivityFeed />
      </div>
    </div>
  );
}
