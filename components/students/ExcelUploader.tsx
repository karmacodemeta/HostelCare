'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { bulkAddStudents } from '@/app/actions/student';
import { getBranches } from '@/app/actions/branch';

export default function ExcelUploader() {
  const [data, setData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [branches, setBranches] = useState<{_id: string, name: string}[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const fetchBranches = async () => {
          const data = await getBranches();
          setBranches(data);
          // Default to first branch if available
          if (data.length > 0) setSelectedBranchId(data[0]._id);
      };
      fetchBranches();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      if (rawData.length === 0) {
        setUploadStatus({ success: false, message: "File is empty." });
        return;
      }

      // Heuristic: Check if first row looks like headers
      const firstRow = rawData[0];
      const hasHeaders = firstRow.some(cell => 
        typeof cell === 'string' && ['name', 'guardian', 'room', 'address'].some(key => cell.toLowerCase().includes(key))
      );

      let parsedData: any[] = [];

      if (hasHeaders) {
         const jsonData = XLSX.utils.sheet_to_json(ws);
         parsedData = jsonData.map((row: any) => {
            const newRow: any = {};
            const keys = Object.keys(row);
            
            // Clean value helper to strip quotes and leading/trailing spaces
            const cleanVal = (v: any) => {
                if (typeof v === 'string') {
                    return v.replace(/^["']|["']$/g, '').trim();
                }
                return v;
            };

            // Handle edge case where entire line is wrapped in quotes
            if (keys.length === 1 && keys[0].includes(',')) {
                const headerParts = keys[0].split(',').map(s => s.trim().replace(/^["']|["']$/g, '').toLowerCase());
                const valParts = String(row[keys[0]]).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
                
                headerParts.forEach((header, index) => {
                    const normalizedKey = header;
                    const val = valParts[index] || '';
                    
                    if (normalizedKey.includes('name')) newRow.name = val;
                    else if (normalizedKey.includes('guardian') || normalizedKey.includes('father')) newRow.guardian = val;
                    else if (normalizedKey.includes('room')) newRow.room = val;
                    else if (normalizedKey.includes('address')) newRow.address = val;
                    else if (normalizedKey.includes('rent')) newRow.rent = val;
                    else if (normalizedKey.includes('due')) newRow.dues = val;
                    else if (normalizedKey.includes('contact') || normalizedKey.includes('phone') || normalizedKey.includes('mobile')) newRow.contactNumber = val;
                });
            } else {
                Object.keys(row).forEach(key => {
                    const normalizedKey = key.trim().replace(/^["']|["']$/g, '').toLowerCase();
                    const val = cleanVal(row[key]);
                    
                    if (normalizedKey.includes('name')) newRow.name = val;
                    else if (normalizedKey.includes('guardian') || normalizedKey.includes('father')) newRow.guardian = val;
                    else if (normalizedKey.includes('room')) newRow.room = val;
                    else if (normalizedKey.includes('address')) newRow.address = val;
                    else if (normalizedKey.includes('rent')) newRow.rent = val;
                    else if (normalizedKey.includes('due')) newRow.dues = val;
                    else if (normalizedKey.includes('contact') || normalizedKey.includes('phone') || normalizedKey.includes('mobile')) newRow.contactNumber = val;
                    else if (normalizedKey.includes('branch')) newRow.branch = val;
                    else newRow[normalizedKey] = val;
                });
            }
            return newRow;
         });
      } else {
         parsedData = rawData.map(row => {
            const cleanVal = (v: any) => {
                if (typeof v === 'string') {
                    return v.replace(/^["']|["']$/g, '').trim();
                }
                return v;
            };
            return {
                name: cleanVal(row[0]),
                guardian: cleanVal(row[1]),
                room: cleanVal(row[2]),
                address: cleanVal(row[3]),
                rent: cleanVal(row[4]),
                dues: cleanVal(row[5]),
                contactNumber: cleanVal(row[6]), // Assume 7th column is contact if no headers
                branch: cleanVal(row[7]) 
            };
         }).filter(row => row.name);
      }

      setData(parsedData);
      setUploadStatus(null);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const students = data.map(item => ({
        name: item.name,
        contactNumber: item.contactNumber || 'Not Provided',
        guardian: item.guardian || 'Unknown',
        roomNo: item.room ? String(item.room) : 'Unassigned',
        address: item.address || 'Unknown',
        rent: Number(item.rent || 0),
        dues: Number(item.dues || 0),
        branchId: selectedBranchId || undefined
      }));

      const validStudents = students.filter(s => s.name && s.name.trim() !== '');

      if (validStudents.length === 0) {
          setUploadStatus({ success: false, message: 'No valid student data found.' });
          setIsUploading(false);
          return;
      }

      const result = await bulkAddStudents(validStudents);
      setUploadStatus(result);
      if (result.success) {
        setData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadStatus({ success: false, message: 'Unexpected error during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Branch</label>
        <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select 
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
                {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
        <FileSpreadsheet className="w-12 h-12 text-zinc-400 mb-4" />
        <p className="text-sm text-zinc-500 mb-4 text-center">
          Upload <strong>.xlsx</strong> or <strong>.csv</strong> file.<br />
          <span className="text-xs opacity-70">Columns: Name, Guardian, Room, Address, Rent, Dues</span>
        </p>
        
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          className="hidden" 
          ref={fileInputRef}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all"
        >
          <Upload className="w-4 h-4" />
          Select File
        </button>
      </div>

      {uploadStatus && (
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3",
          uploadStatus.success 
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {uploadStatus.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{uploadStatus.message}</p>
        </div>
      )}

      {data.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Preview ({data.length} Students)</h3>
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 sticky top-0">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
