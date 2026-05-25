'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, IndianRupee } from 'lucide-react';
import { collectRent } from '@/app/actions/payment';
import { toast } from 'sonner';

interface Student {
    _id: string;
    name: string;
    roomNo: string;
    rent: number;
    dues: number;
}

interface PaymentEntry {
    studentId: string;
    name: string;
    amount: number;
}

interface RentCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedStudents: Student[];
    onSuccess: () => void;
}

export function RentCollectionDialog({ open, onOpenChange, selectedStudents, onSuccess }: RentCollectionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'online'>('cash');
    
    // Initialize payments with default rent amount
    const [payments, setPayments] = useState<PaymentEntry[]>(() => {
        return selectedStudents.map(s => ({
            studentId: s._id,
            name: s.name,
            amount: s.rent
        }));
    });

    // Reset payments when selection changes
    useMemo(() => {
         setPayments(selectedStudents.map(s => ({
            studentId: s._id,
            name: s.name,
            amount: s.rent
        })));
    }, [selectedStudents]);

    const handleAmountChange = (studentId: string, amount: string) => {
        setPayments(prev => prev.map(p => 
            p.studentId === studentId ? { ...p, amount: Number(amount) } : p
        ));
    };

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const handleConfirm = async () => {
        setLoading(true);
        const payload = payments.map(p => ({
            studentId: p.studentId,
            amount: p.amount,
            date: new Date(),
            paymentMethod: paymentMethod
        }));

        const result = await collectRent(payload);
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            onOpenChange(false);
            onSuccess();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Collect Rent</DialogTitle>
                    <DialogDescription>
                        Confirm payment amounts for {selectedStudents.length} student(s).
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[250px] overflow-y-auto space-y-3 py-2">
                    {payments.map((p) => (
                        <div key={p.studentId} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{p.name}</p>
                            </div>
                            <div className="relative w-32">
                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                                <Input 
                                    type="number" 
                                    value={p.amount} 
                                    className="pl-7 h-8 text-right"
                                    onChange={(e) => handleAmountChange(p.studentId, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="py-2 space-y-2 border-t pt-3">
                    <Label htmlFor="paymentMethod" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Payment Method</Label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e: any) => setPaymentMethod(e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI / QR Code</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online / Razorpay</option>
                    </select>
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between border-t pt-4">
                    <div className="flex flex-col">
                         <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Collection</span>
                         <span className="text-lg font-bold text-green-600">₹{totalAmount}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm & Collect
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
