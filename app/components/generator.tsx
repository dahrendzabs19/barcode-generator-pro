"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, FileArchive, FileText } from "lucide-react";
import type { ProductRow } from "@/types";
import { parseSpreadsheet } from "@/lib/spreadsheet";
import { exportPdf, exportPng, exportPngZip, exportSvg, exportZip } from "@/lib/exports";
import { BarcodePreview } from "./barcode-preview";
import { FileUpload } from "./file-upload";

export function Generator() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState(""); const [exporting, setExporting] = useState(false);
  const [imported, setImported] = useState(false);
  const selected = useMemo(() => rows.find((row) => row.id === selectedId) ?? rows[0], [rows, selectedId]);

  async function importFile(file: File): Promise<void> {
    const result = await parseSpreadsheet(file);
    if (result.error) { setStatus(result.error); return; }
    setRows(result.rows); setSelectedId(result.rows[0]?.id ?? ""); setImported(true); setStatus(`${result.validCount.toLocaleString()} valid barcode${result.validCount === 1 ? "" : "s"} imported.`);
  }
  async function run(action: () => Promise<void>): Promise<void> {
    if (!rows.length) { setStatus("Import at least one barcode first."); return; }
    setExporting(true); try { await action(); setStatus("Download started."); } catch { setStatus("Export failed. Check the imported barcode values."); } finally { setExporting(false); }
  }

  const validRows = rows.filter((row) => row.valid);
  const invalidCount = rows.length - validRows.length;
  return <main className="min-h-screen bg-slate-100 p-5 text-slate-900"><div className="mx-auto max-w-6xl"><header className="mb-5"><h1 className="text-2xl font-bold tracking-tight">Code 128 Vector Export</h1><p className="mt-1 text-sm text-slate-500">Editable SVG and vector-only PDF barcode output.</p></header>
    <section className="mb-5 rounded-xl bg-white p-5 shadow-sm"><FileUpload onFile={importFile} disabled={exporting} imported={imported} />{imported && <><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Imported</p><p className="mt-1 text-2xl font-bold">{rows.length.toLocaleString()}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Valid</p><p className="mt-1 text-2xl font-bold text-emerald-700">{validRows.length.toLocaleString()}</p></div><div className="rounded-xl bg-rose-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Invalid</p><p className="mt-1 text-2xl font-bold text-rose-700">{invalidCount.toLocaleString()}</p></div></div>{invalidCount > 0 && <p className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"><AlertTriangle size={16}/> {invalidCount.toLocaleString()} invalid row{invalidCount === 1 ? "" : "s"} skipped</p>}</>}</section>
    {status && <p className="mb-5 rounded-lg bg-white px-4 py-3 text-sm shadow-sm">{status}</p>}
    {!imported && <div className="rounded-xl bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">No spreadsheet loaded yet.</div>}
    {imported &&
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]"><section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Imported barcodes</h2><div className="max-h-[620px] overflow-y-auto">{rows.map((row, index) => <button key={row.id} onClick={() => setSelectedId(row.id)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm ${selected?.id === row.id ? "bg-slate-900 text-white" : row.valid ? "hover:bg-slate-100" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"}`}><span className="truncate font-mono">{row.barcode || "Empty value"}</span><span className="ml-2 text-xs opacity-60">{row.valid ? String(index + 1).padStart(4, "0") : "Invalid"}</span></button>)}</div></section>
      <section className="rounded-xl bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Selected barcode</p><h2 className="mt-1 break-all font-mono text-xl font-bold">{selected?.barcode ?? "No barcode selected"}</h2>{selected && !selected.valid && <p className="mt-2 text-sm text-rose-600">{selected.error}</p>}</div><div className="flex flex-wrap gap-2"><button disabled={exporting || !selected?.valid} onClick={() => selected && void run(() => exportSvg(selected))} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"><FileText size={16}/>Download SVG</button><button disabled={exporting || !selected?.valid} onClick={() => selected && void run(() => exportPng(selected))} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"><Download size={16}/>Download PNG</button><button disabled={exporting || !selected?.valid} onClick={() => selected && void run(() => exportPdf([selected]))} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"><Download size={16}/>Download PDF</button><button disabled={exporting || !validRows.length} onClick={() => void run(() => exportPdf(validRows))} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={16}/>Batch PDF</button><button disabled={exporting || !validRows.length} onClick={() => void run(() => exportZip(validRows))} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><FileArchive size={16}/>barcode.zip</button><button disabled={exporting || !validRows.length} onClick={() => void run(() => exportPngZip(validRows))} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><FileArchive size={16}/>PNG ZIP</button></div></div><div className="mt-8 rounded-lg border border-slate-200 bg-white p-8">{selected?.valid ? <BarcodePreview value={selected.barcode} /> : <p className="text-sm text-rose-600">Select a valid barcode to preview it.</p>}</div><p className="mt-5 text-sm leading-6 text-slate-500">SVG is the master source. PNG is rendered directly from that SVG at 4× intrinsic dimensions with a white background.</p></section></div>
    }</div></main>;
}
