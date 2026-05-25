'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createHostel } from '@/app/actions/super-admin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
        </button>
    );
}

export function AddHostelDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createHostel, { success: false, message: '' });

    // Close on success
    // This requires useEffect, but kept simple for now
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-all font-medium">
                    <Plus className="w-4 h-4" />
                    Onboard Hostel
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Onboard New Hostel</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-4 pt-4">
                    {state?.message && !state.success && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{state.message}</div>
                    )}
                     {state?.success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">{state.message}</div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hostel Name</label>
                        <input name="name" required className="w-full p-2 rounded-lg border bg-transparent" placeholder="e.g. Sunshine Hostel" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Owner Name</label>
                            <input name="ownerName" required className="w-full p-2 rounded-lg border bg-transparent" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Contact</label>
                             <input name="contactNumber" required className="w-full p-2 rounded-lg border bg-transparent" placeholder="+91..." />
                         </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm font-medium">Address</label>
                         <input name="address" required className="w-full p-2 rounded-lg border bg-transparent" placeholder="Full address..." />
                     </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Owner Email (Login)</label>
                        <input name="ownerEmail" type="email" required className="w-full p-2 rounded-lg border bg-transparent" placeholder="owner@example.com" />
                    </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium">Initial Password</label>
                        <input name="ownerPassword" type="text" required className="w-full p-2 rounded-lg border bg-transparent" defaultValue="hostel123" />
                    </div>

                    <SubmitButton />
                </form>
            </DialogContent>
        </Dialog>
    );
}
