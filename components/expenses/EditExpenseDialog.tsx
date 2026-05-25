'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Loader2 } from 'lucide-react';
import { updateExpense, getCategories } from '@/app/actions/expense';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface Expense {
    _id: string;
    description?: string;
    amount: number;
    date: string; // ISO string
    category: string;
}

export function EditExpenseDialog({ expense }: { expense: Expense }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            console.log('Fetching categories...');
            getCategories()
                .then(data => {
                    console.log('Fetched categories:', data);
                    setCategories(data as unknown as { _id: string; name: string }[]);
                })
                .catch(err => console.error('Failed to fetch categories:', err));
        }
    }, [isOpen]);

    const [formData, setFormData] = useState({
        description: expense.description || '',
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split('T')[0],
        category: expense.category
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateExpense(expense._id, formData);
        setLoading(false);

        if (result.success) {
            setIsOpen(false);
            toast.success('Expense updated');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <Edit2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input 
                            type="number"
                            value={formData.amount} 
                            onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                            type="date"
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <select 
                            value={formData.category} 
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Expense'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
