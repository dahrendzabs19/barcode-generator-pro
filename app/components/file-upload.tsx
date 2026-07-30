"use client";

import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFile, disabled = false }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "text/csv": [".csv"] },
    maxFiles: 1,
    disabled,
    onDropAccepted: (files) => { const file = files[0]; if (file) onFile(file); },
  });
  return <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300"}`}>
    <input {...getInputProps()} />
    <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><UploadCloud size={22} /></div>
    <p className="font-semibold text-slate-800">Drop your spreadsheet here, or browse</p>
    <p className="mt-1 text-sm text-slate-500"><FileSpreadsheet className="mr-1 inline size-4" />CSV and XLSX files are supported</p>
  </div>;
}
