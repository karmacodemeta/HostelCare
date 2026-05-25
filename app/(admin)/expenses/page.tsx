import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import Expense from '@/models/Expense';
import '@/models/Branch'; // Ensure model is registered
import AddExpenseForm from '@/components/expenses/AddExpenseForm';
import { Card } from '@/components/ui/card';
import { EditExpenseDialog } from '@/components/expenses/EditExpenseDialog';
import ExpenseCategoryChart from '@/components/expenses/ExpenseCategoryChart';
import { getBranches } from '@/app/actions/branch';
import { CreditCard, ShieldAlert, Calendar, LayoutGrid, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ branch?: string; startDate?: string; endDate?: string }> 
}) {
  const session = await getSession();
  if (!session || !session.user.hostelId) redirect('/login');

  await connectDB();
  const { branch, startDate, endDate } = await searchParams;
  
  const filter: any = { hostelId: session.user.hostelId };
  if (branch) filter.branchId = branch;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  // Fetch data
  const [expenses, branches] = await Promise.all([
    Expense.find(filter).populate('branchId').sort({ date: -1 }).lean(),
    getBranches()
  ]);

  // Compute stats
  let totalSpent = 0;
  let foodSpent = 0;
  let staffSpent = 0;
  let billsSpent = 0;

  const categorySums: { [key: string]: number } = {};

  expenses.forEach((e: any) => {
    const amount = e.amount || 0;
    totalSpent += amount;
    
    // Categorized stats
    if (e.category === 'Food') foodSpent += amount;
    else if (e.category === 'Staff') staffSpent += amount;
    else if (e.category === 'Electricity' || e.category === 'Repair') billsSpent += amount;

    // Chart breakdown
    const cat = e.category || 'Others';
    categorySums[cat] = (categorySums[cat] || 0) + amount;
  });

  const chartData = Object.entries(categorySums).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const stats = [
    {
      title: "Total Expenses",
      value: `₹${totalSpent.toLocaleString()}`,
      description: "Logged matching filters",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
    },
    {
      title: "Food & Groceries",
      value: `₹${foodSpent.toLocaleString()}`,
      description: "Mess and catering",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Staff & Salaries",
      value: `₹${staffSpent.toLocaleString()}`,
      description: "Hostel care crew wages",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      title: "Utilities & Bills",
      value: `₹${billsSpent.toLocaleString()}`,
      description: "Electricity, internet, repairs",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Expense Tracker</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Log, categorize, and monitor operational spendings.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">{stat.title}</span>
            <div className="space-y-1">
              <span className={`text-2xl font-extrabold ${stat.color.split(' ')[0]}`}>{stat.value}</span>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Date & Branch Range Filters */}
      <Card className="p-4 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
        <form method="GET" className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Branch</label>
            <select 
              name="branch" 
              defaultValue={branch || ""}
              className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100"
            >
              <option value="">All Branches</option>
              {branches.map((b: any) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Start Date</label>
            <input 
              type="date" 
              name="startDate" 
              defaultValue={startDate || ""}
              className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">End Date</label>
            <input 
              type="date" 
              name="endDate" 
              defaultValue={endDate || ""}
              className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
            >
              Apply Filter
            </button>
            <Link 
              href="/expenses"
              className="px-3 h-10 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm font-medium transition flex items-center justify-center"
            >
              Reset
            </Link>
          </div>
        </form>
      </Card>

      {/* Main Grid: Left is forms & charts, Right is table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <AddExpenseForm />
          <ExpenseCategoryChart data={chartData} />
        </div>

        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden border border-neutral-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
            <div className="p-5 border-b border-neutral-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Expense Logs</h3>
              <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-semibold">
                {expenses.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {expenses.map((expense: any) => (
                    <tr key={expense._id.toString()} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {new Date(expense.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                        {expense.branchId?.name || <span className="text-zinc-400 italic">No Branch</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 max-w-[180px] truncate">
                        {expense.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-rose-500 font-bold">
                        ₹{expense.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        <EditExpenseDialog expense={JSON.parse(JSON.stringify(expense))} />
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                        No expenses logged for current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
