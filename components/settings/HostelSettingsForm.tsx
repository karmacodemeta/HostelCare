'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Home, Phone, User, MapPin } from 'lucide-react';
import { updateHostelSettings } from '@/app/actions/hostel';
import { toast } from 'sonner';

interface Hostel {
  name: string;
  ownerName: string;
  address: string;
  contactNumber: string;
  subscriptionStatus: string;
}

interface HostelSettingsFormProps {
  hostel: Hostel;
}

export default function HostelSettingsForm({ hostel }: HostelSettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateHostelSettings(formData);
    
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Settings Form Column */}
      <Card className="p-6 md:col-span-2 shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
        <div className="border-b pb-3">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Profile Details</h3>
          <p className="text-xs text-zinc-500">Edit business details that appear on receipts and onboarding forms</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-zinc-500 uppercase">Hostel Name</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={hostel.name} 
                  required 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ownerName" className="text-xs font-semibold text-zinc-500 uppercase">Proprietor / Owner Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  id="ownerName" 
                  name="ownerName" 
                  defaultValue={hostel.ownerName} 
                  required 
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactNumber" className="text-xs font-semibold text-zinc-500 uppercase">Business Helpline / Contact</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                id="contactNumber" 
                name="contactNumber" 
                defaultValue={hostel.contactNumber} 
                required 
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold text-zinc-500 uppercase">Address / Headquarters</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <textarea 
                id="address" 
                name="address" 
                defaultValue={hostel.address} 
                required 
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100 pl-10 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Subscription Status Column */}
      <Card className="p-6 md:col-span-1 shadow-sm border-neutral-100 dark:border-zinc-800 bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-zinc-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col justify-between h-fit space-y-6">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">Subscription Tier</h3>
            <p className="text-xs text-zinc-500">System license and permissions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-indigo-100/50 bg-indigo-50/20 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Plan Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 capitalize">
                {hostel.subscriptionStatus} Premium
              </span>
            </div>
          </div>

          <div className="text-xs text-zinc-500 space-y-2">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">Features unlocked:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Multiple branches management</li>
              <li>Automated PDF receipt generators</li>
              <li>Interactive dashboard analytics</li>
              <li>Spotlight onboarding support</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
