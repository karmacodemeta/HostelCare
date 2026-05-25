'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { EditStudentDialog } from '@/components/dashboard/EditStudentDialog';
import { RentCollectionDialog } from '@/components/dashboard/RentCollectionDialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; 
import { Banknote, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
    _id: string;
    name: string;
    branchId: any;
    roomNo: string;
    rent: number;
    dues: number;
    guardian: string;
    address: string;
}

export function StudentTable({ students }: { students: Student[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(students.map(s => s._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(mid => mid !== id));
        }
    };

    const selectedStudents = students.filter(s => selectedIds.includes(s._id));

    const handleExportCSV = () => {
        if (students.length === 0) return;

        const headers = ['Name', 'Branch', 'Room No', 'Rent', 'Dues', 'Guardian', 'Address'];
        const rows = students.map(s => [
            s.name,
            s.branchId?.name || 'No Branch',
            s.roomNo,
            s.rent,
            s.dues,
            s.guardian,
            `"${s.address?.replace(/"/g, '""') || ''}"`
        ]);

        // Formats CSV with UTF-8 BOM so Excel parses non-ASCII chars correctly
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Resident_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
        toast.success('Resident ledger CSV downloaded successfully');
    };

    return (
        <Card className="p-0 overflow-hidden relative min-h-[500px]">
            {/* Table Header Exporter */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Resident Ledger</span>
                <Button 
                    onClick={handleExportCSV}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold dark:border-zinc-800 gap-1.5 cursor-pointer"
                >
                    <Download className="w-3.5 h-3.5" /> Export CSV Report
                </Button>
            </div>
             {/* Bulk Action Bar - Floating */}
             {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black p-2 pr-4 pl-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200 border border-zinc-800 dark:border-zinc-200">
                    <span className="text-sm font-medium whitespace-nowrap">{selectedIds.length} selected</span>
                    <div className="h-4 w-[1px] bg-zinc-700 dark:bg-zinc-300"></div>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setIsRentDialogOpen(true)}
                        className="gap-2 h-8 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black p-0 hover:text-white dark:hover:text-black"
                    >
                        <Banknote className="w-4 h-4" />
                        Collect Rent
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                    <th className="px-6 py-4 w-12 text-left">
                        <Checkbox 
                            checked={students.length > 0 && selectedIds.length === students.length}
                            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                        />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Rent</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Dues</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {students.map((student) => (
                    <tr key={student._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                            <Checkbox 
                                checked={selectedIds.includes(student._id)}
                                onCheckedChange={(checked) => handleSelectOne(student._id, checked as boolean)}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            <Link href={`/students/${student._id}`} className="hover:underline decoration-zinc-400 underline-offset-4">
                                {student.name}
                            </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                            {(student.branchId as any)?.name || <span className="text-zinc-400 italic">No Branch</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">{student.roomNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">₹{student.rent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">₹{student.dues}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <EditStudentDialog student={student} />
                        </td>
                    </tr>
                    ))}
                    {students.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">No students found.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>

            <RentCollectionDialog 
                open={isRentDialogOpen} 
                onOpenChange={setIsRentDialogOpen}
                selectedStudents={selectedStudents}
                onSuccess={() => setSelectedIds([])}
            />
        </Card>
    );
}
