import connectDB from '@/lib/db';
import Student from '@/models/Student';
import Expense from '@/models/Expense';
import Payment from '@/models/Payment'; // Changed import source logic

import { getSession } from '@/lib/auth';

export async function getDashboardStats() {
    const session = await getSession();
    if (!session || !session.user?.hostelId) {
        return {
            grossRent: 0,
            collectedRent: 0,
            totalExpenses: 0,
            netProfit: 0,
            studentCount: 0,
            expenseCount: 0,
        };
    }

    await connectDB();
    const hostelId = session.user.hostelId;

    // 1. Calculate Gross Rent (Total potential rent from all students)
    const students = await Student.find({ hostelId, isActive: { $ne: false } });
    const grossRent = students.reduce((acc, student) => acc + (student.rent || 0), 0);

    // 2. Calculate Collected Rent (REAL Payments - Type 'rent' only)
    const payments = await Payment.find({ hostelId });
    const collectedRent = payments
        .filter(p => p.type === 'rent')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

    // 3. Calculate Total Expenses
    const expenses = await Expense.find({ hostelId });
    const totalExpenses = expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);

    // 4. Calculate Net Profit (Now considers Rent Revenue - Expenses)
    // Advance is usually a liability or separate capital, so excluding it from immediate profit is standard.
    const netProfit = collectedRent - totalExpenses;

    const totalAdvance = payments
        .filter(p => p.type === 'advance')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
        grossRent,
        collectedRent,
        totalAdvance, // Added to return
        totalExpenses,
        netProfit,
        studentCount: students.length,
        expenseCount: expenses.length,
    };
}
