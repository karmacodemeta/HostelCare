'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Megaphone, Users, UserCheck, ShieldAlert, Trash2, 
  Calendar, Plus, Loader2, Home, Sparkles 
} from 'lucide-react';
import { createNotice, deleteNotice } from '@/app/actions/notice';
import { toast } from 'sonner';

interface Notice {
  _id: string;
  title: string;
  content: string;
  audience: 'all' | 'staff' | 'student';
  createdAt: string;
  branchId?: {
    name: string;
  };
}

interface NoticeBoardClientProps {
  initialNotices: Notice[];
  branches: { _id: string; name: string }[];
}

export default function NoticeBoardClient({ initialNotices, branches }: NoticeBoardClientProps) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'all' | 'staff' | 'student'>('all');
  const [branchId, setBranchId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    const res = await createNotice(title, content, audience, branchId || undefined);
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsOpen(false);
      
      // Reset form
      setTitle('');
      setContent('');
      setAudience('all');
      setBranchId('');

      // Refresh list (normally do full reload or update state)
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    setDeleteLoadingId(id);
    const res = await deleteNotice(id);
    setDeleteLoadingId(null);

    if (res.success) {
      toast.success(res.message);
      setNotices(prev => prev.filter(n => n._id !== id));
    } else {
      toast.error(res.message);
    }
  };

  const getAudienceBadge = (aud: string) => {
    switch (aud) {
      case 'all': 
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 uppercase flex items-center gap-1"><Users className="w-3 h-3" /> All Residents</span>;
      case 'student':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 uppercase flex items-center gap-1"><UserCheck className="w-3 h-3" /> Students</span>;
      case 'staff':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Staff Only</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block with Create action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Notice Board
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Publish guidelines, circulars, and announcements for your residents.</p>
        </div>
        
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold px-5 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Announcement
        </Button>
      </div>

      {/* Grid of notices */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notices.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-zinc-500 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-xl">
            No announcements posted yet. Click "Add Announcement" to create one! 📣
          </div>
        ) : (
          notices.map((n) => (
            <Card 
              key={n._id} 
              className="p-5 flex flex-col justify-between border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm relative group hover:shadow-md transition"
            >
              <div className="space-y-4">
                {/* Meta details & tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  {getAudienceBadge(n.audience)}
                </div>

                {/* Main Content */}
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-850 dark:text-zinc-100 text-base flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {n.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed min-h-[64px]">
                    {n.content}
                  </p>
                </div>
              </div>

              {/* Branch Tag & Delete Button */}
              <div className="flex items-center justify-between border-t pt-3 mt-4 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                <span className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-zinc-300" />
                  {n.branchId?.name || 'All Branches'}
                </span>
                
                <button
                  onClick={() => handleDelete(n._id)}
                  disabled={deleteLoadingId === n._id}
                  className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Remove Notice"
                >
                  {deleteLoadingId === n._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Creation Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" /> Post New Announcement
            </DialogTitle>
            <DialogDescription>
              Broadcast alerts, guidelines, or instructions to residents.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice-title" className="text-xs font-semibold text-zinc-500 uppercase">Notice Title</Label>
              <Input 
                id="notice-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. WiFi Maintenance Schedule" 
                required 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="notice-audience" className="text-xs font-semibold text-zinc-500 uppercase">Target Audience</Label>
                <select
                  id="notice-audience"
                  value={audience}
                  onChange={(e: any) => setAudience(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="all">All Residents</option>
                  <option value="student">Students Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notice-branch" className="text-xs font-semibold text-zinc-500 uppercase">Target Branch</Label>
                <select
                  id="notice-branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notice-content" className="text-xs font-semibold text-zinc-500 uppercase">Announcement Details</Label>
              <textarea
                id="notice-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write the announcement message details here..."
                required
                className="w-full p-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none leading-relaxed"
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Broadcast Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
