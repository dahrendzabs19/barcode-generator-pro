"use client";

import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  imported?: boolean;
}

export function FileUpload({ onFile, disabled = false, imported = false }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "text/csv": [".csv"] },
    maxFiles: 1,
    disabled,
    onDropAccepted: (files) => { const file = files[0]; if (file) onFile(file); },
  });
  return <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed text-center transition-all duration-200 ${imported ? "p-4" : "p-10 sm:p-14"} ${isDragActive ? "scale-[1.01] border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40"}`}>
    <input {...getInputProps()} />
    {imported ? <p className="text-sm font-medium text-slate-600"><UploadCloud className="mr-2 inline size-4 text-indigo-600" />Drop another XLSX or CSV file here to replace this dataset</p> : <><div className="mb-3 text-4xl" aria-hidden="true">📄</div><p className="font-semibold text-slate-800">Drag &amp; Drop XLSX or CSV here</p><p className="my-2 text-sm text-slate-400">or</p><p className="font-medium text-indigo-700">Click to browse</p><p className="mt-4 text-xs text-slate-500"><FileSpreadsheet className="mr-1 inline size-4" />Accepted: .xlsx · .csv</p></>}
  </div>;
}
