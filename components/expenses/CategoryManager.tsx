'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Plus, Trash2, Loader2 } from 'lucide-react';
import { getCategories, addCategory, deleteCategory } from '@/app/actions/expense';
import { toast } from 'sonner';

interface Category {
    _id: string;
    name: string;
    isDefault: boolean;
}

export function CategoryManager({ onUpdate }: { onUpdate: () => void }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchCategories = async () => {
        const data = await getCategories();
        // Cast the result to match the Category interface
        setCategories(data as unknown as Category[]);
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        setLoading(true);
        const result = await addCategory(newCategory);
        setLoading(false);

        if (result.success) {
            setNewCategory('');
            fetchCategories();
            onUpdate();
            toast.success('Category added');
        } else {
            toast.error(result.message);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteCategory(id);
        if (result.success) {
            fetchCategories();
            onUpdate();
            toast.success('Category deleted');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="New Category Name" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {categories.map(cat => (
                            <div key={cat._id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <span className="text-sm font-medium">{cat.name}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(cat._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
