'use client';

import { useState } from 'react';
import { updateStudent } from '@/app/actions/student';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditStudentButton({ student }: { student: any }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const formData = new FormData(e.currentTarget);
        
        try {
            // @ts-ignore
            const result = await updateStudent(student._id, formData);
            if (result && result.success) {
                setOpen(false);
                router.refresh();
            } else {
                setError(result?.message || 'Failed to update');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-4 h-4" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                    <DialogDescription>
                        Make changes to student profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={student.name} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="roomNo">Room No</Label>
                            <Input id="roomNo" name="roomNo" defaultValue={student.roomNo} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rent">Rent Amount</Label>
                            <Input id="rent" name="rent" type="number" defaultValue={student.rent} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="dues">Current Dues</Label>
                            <Input id="dues" name="dues" type="number" defaultValue={student.dues} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="contactNumber">Contact</Label>
                            <Input id="contactNumber" name="contactNumber" defaultValue={student.contactNumber} required />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
