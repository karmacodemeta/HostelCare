'use client';

import { useState } from 'react';
import { deleteStudent } from '@/app/actions/student';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle } from 'lucide-react';
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

export default function DeleteStudentButton({ studentId, studentName }: { studentId: string, studentName: string }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteStudent(studentId);
            if (result.success) {
                setOpen(false);
                router.push('/students');
                router.refresh();
            } else {
                alert(result.message);
                setLoading(false);
            }
        } catch (error) {
            alert('Failed to delete');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Delete Student?
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{studentName}</strong>?
                        This will remove them from the active list. Their records will be preserved for history.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={handleDelete} 
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Student'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
