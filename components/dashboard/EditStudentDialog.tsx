'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Loader2, Building2 } from 'lucide-react';
import { updateStudent } from '@/app/actions/student';
import { toast } from 'sonner';

interface Student {
    _id: string;
    name: string;
    guardian: string;
    roomNo: string;
    rent: number;
    dues: number;
    address: string;
    branchId: any;
}

export function EditStudentDialog({ student }: { student: Student }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        // Ensure branchId is passed if available
        if (student.branchId?._id) {
            formData.append('branchId', student.branchId._id);
        }
        
        const result = await updateStudent(student._id, formData);
        setLoading(false);

        if (result.success) {
            toast.success('Student updated');
            setOpen(false);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                    <Edit2 className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input name="name" defaultValue={student.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Guardian</Label>
                            <Input name="guardian" defaultValue={student.guardian} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Room No</Label>
                            <Input name="roomNo" defaultValue={student.roomNo} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Rent Amount (₹)</Label>
                            <Input type="number" name="rent" defaultValue={student.rent} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Current Dues (₹)</Label>
                            <Input type="number" name="dues" defaultValue={student.dues} className="text-red-500 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input name="address" defaultValue={student.address} required />
                        </div>
                    </div>
                    
                    {/* Read Only Branch Info */}
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg flex items-center gap-2 text-sm text-zinc-500">
                        <Building2 className="w-4 h-4" />
                        <span>Branch: {student.branchId?.name || 'Main Branch'}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
