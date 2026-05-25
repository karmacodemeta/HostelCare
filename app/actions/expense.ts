'use server';

import connectDB from '@/lib/db';
import Expense from '@/models/Expense';
import { revalidatePath } from 'next/cache';

export type ActionState = {
    success: boolean;
    message: string;
};

import ExpenseCategory from '@/models/ExpenseCategory';
import { logActivity } from '@/lib/logger';
import { generateDiff } from '@/lib/utils';

import { getSession } from '@/lib/auth';

export async function getCategories() {
    const session = await getSession();
    if (!session || !session.user?.hostelId) return [];

    await connectDB();

    // Use upsert to prevent duplicates strictly
    // Auto-seeding removed in favor of seeding at hostel creation time

    const categories = await ExpenseCategory.find({ hostelId: session.user.hostelId }).sort({ name: 1 }).lean();
    return categories.map(cat => ({
        ...cat,
        _id: cat._id.toString(),
        hostelId: cat.hostelId?.toString(),
    }));
}

export async function addCategory(name: string) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return { success: false, message: 'Unauthorized' };

        await connectDB();
        const newCategory = await ExpenseCategory.create({
            name,
            hostelId: session.user.hostelId
        });

        await logActivity(
            'CATEGORY_ADDED',
            'Expense', // Using Expense as entity type for categories too
            newCategory._id,
            { name }
        );

        return { success: true, message: 'Category added' };
    } catch (error) {
        return { success: false, message: 'Category already exists' };
    }
}

export async function deleteCategory(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return { success: false, message: 'Unauthorized' };

        await connectDB();
        const deletedCategory = await ExpenseCategory.findOneAndDelete({ _id: id, hostelId: session.user.hostelId });

        if (deletedCategory) {
            await logActivity(
                'CATEGORY_DELETED',
                'Expense',
                deletedCategory._id,
                { name: deletedCategory.name }
            );
        }

        return { success: true, message: 'Category deleted' };
    } catch (error) {
        return { success: false, message: 'Failed to delete' };
    }
}

export async function addExpense(prevState: ActionState, formData: FormData) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return { success: false, message: 'Unauthorized' };

        await connectDB();

        const newExpense = new Expense({
            category: formData.get('category'),
            amount: Number(formData.get('amount')),
            date: new Date(formData.get('date') as string),
            description: formData.get('description'),
            branchId: (formData.get('branchId') as string) || undefined,
            hostelId: session.user.hostelId
        });

        await newExpense.save();

        await logActivity(
            'EXPENSE_ADDED',
            'Expense',
            newExpense._id,
            {
                amount: newExpense.amount,
                category: newExpense.category,
                description: newExpense.description
            }
        );

        revalidatePath('/dashboard');
        revalidatePath('/expenses');

        return { success: true, message: 'Expense added successfully' };
    } catch (error) {
        console.error('Failed to add expense:', error);
        return { success: false, message: 'Failed to add expense' };
    }
}

export async function updateExpense(id: string, data: any) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return { success: false, message: 'Unauthorized' };

        await connectDB();
        const oldExpense = await Expense.findOne({ _id: id, hostelId: session.user.hostelId });
        if (!oldExpense) return { success: false, message: 'Expense not found' };

        // Calculate diffs for logging
        // Calculate diffs for logging
        const changes = generateDiff(oldExpense, data, ['amount', 'category', 'description', 'date']);

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: id, hostelId: session.user.hostelId },
            data,
            { new: true }
        );

        if (updatedExpense && Object.keys(changes).length > 0) {
            await logActivity(
                'EXPENSE_UPDATED',
                'Expense',
                updatedExpense._id,
                changes
            );
        }

        revalidatePath('/dashboard');
        revalidatePath('/expenses');

        return { success: true, message: 'Expense updated' };
    } catch (error) {
        return { success: false, message: 'Failed to update expense' };
    }
}

export async function deleteExpense(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return { success: false, message: 'Unauthorized' };

        await connectDB();
        const deletedExpense = await Expense.findOneAndDelete({ _id: id, hostelId: session.user.hostelId });

        if (deletedExpense) {
            await logActivity(
                'EXPENSE_DELETED',
                'Expense',
                deletedExpense._id,
                {
                    amount: deletedExpense.amount,
                    description: deletedExpense.description,
                    category: deletedExpense.category
                }
            );
        }

        revalidatePath('/dashboard');
        revalidatePath('/expenses');

        return { success: true, message: 'Expense deleted' };
    } catch (error) {
        return { success: false, message: 'Failed to delete expense' };
    }
}
