import React from 'react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { Upload, FileSpreadsheet, AlertCircle, Download } from 'lucide-react';

interface ExcelImportProps {
  onImport: (students: Student[]) => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImport }) => {
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'Name': 'John Doe',
        'Student ID': '1001',
        'Class': 'Six',
        'Roll': '01',
        'Section': 'A',
        'Group': 'Science',
        'Session': '2024-25',
        'Father Name': 'Robert Doe',
        'Mother Name': 'Mary Doe',
        'Address': 'Dhaka, Bangladesh',
        'Blood Group': 'O+',
        'Phone': '01700000000'
      },
      {
        'Name': 'Jane Smith',
        'Student ID': '1002',
        'Class': 'Seven',
        'Roll': '02',
        'Section': 'B',
        'Group': 'General',
        'Session': '2024-25',
        'Father Name': 'Michael Smith',
        'Mother Name': 'Sarah Smith',
        'Address': 'Chittagong, Bangladesh',
        'Blood Group': 'A+',
        'Phone': '01800000000'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_sample_data.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const importedStudents: Student[] = data.map((row, index) => ({
        id: crypto.randomUUID(),
        name: row.Name || row.name || row['Student Name'] || '',
        fatherName: row['Father Name'] || row['Father'] || row.father || '',
        motherName: row['Mother Name'] || row['Mother'] || row.mother || '',
        address: row.Address || row.address || row['Present Address'] || '',
        studentId: String(row.ID || row.id || row['Student ID'] || row.Roll || index + 1),
        class: String(row.Class || row.class || ''),
        section: String(row.Section || row.section || ''),
        roll: String(row.Roll || row.roll || ''),
        group: String(row.Group || row.group || ''),
        session: String(row.Session || row.session || ''),
        bloodGroup: String(row['Blood Group'] || row.blood || ''),
        phone: String(row.Phone || row.phone || row['Mobile No'] || ''),
      }));

      onImport(importedStudents);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Import Students</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Bulk upload student records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <label className="sm:col-span-3 flex flex-col items-center justify-center h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-emerald-50/30 hover:border-emerald-300 transition-all group overflow-hidden">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Click to upload</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Excel file (.xlsx, .xls)</p>
          </div>
          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </label>

        <button
          onClick={downloadSampleExcel}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:bg-slate-50 hover:border-slate-200 transition-all group shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
            <Download className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Sample</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Download</span>
        </button>
      </div>

      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 items-start">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
          <AlertCircle className="text-indigo-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Data Requirements</p>
          <p className="text-xs text-indigo-900 font-medium leading-relaxed">
            Ensure your Excel has columns like: <span className="font-black">Name, ID, Class, Roll, Blood Group, Phone</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
