import JSZip from "jszip";
import { PDFDocument, rgb } from "pdf-lib";
import type { ProductRow } from "@/types";

interface SvgPath { strokeWidth: number; segments: Array<{ x1: number; y1: number; x2: number; y2: number }>; }
interface VectorBarcode { width: number; height: number; paths: SvgPath[]; svg: string; }

async function engine() { return import("bwip-js/browser"); }

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function barcodeFilename(value: string): string {
  const cleaned = value.trim().replace(/[\\/:*?"<>|]/g, "-");
  return cleaned || "barcode";
}

function uniqueFilename(value: string, used: Set<string>): string {
  const base = barcodeFilename(value); let candidate = base; let suffix = 1;
  while (used.has(candidate.toLowerCase())) { candidate = `${base}-${suffix}`; suffix += 1; }
  used.add(candidate.toLowerCase()); return `${candidate}.svg`;
}

function parseVectorSvg(svg: string): VectorBarcode {
  const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  if (!viewBox) throw new Error("Barcode SVG did not include vector dimensions.");
  const paths: SvgPath[] = [];
  const tags = svg.match(/<path\s+[^>]*\/>/g) ?? [];
  for (const tag of tags) {
    const widthMatch = /stroke-width="([\d.]+)"/.exec(tag); const dataMatch = /d="([^"]+)"/.exec(tag);
    if (!widthMatch || !dataMatch) continue;
    const segments: SvgPath["segments"] = [];
    const commands = /M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)/g;
    let match: RegExpExecArray | null;
    while ((match = commands.exec(dataMatch[1] ?? "")) !== null) {
      const [, x1, y1, x2, y2] = match;
      if (x1 && y1 && x2 && y2) segments.push({ x1: Number(x1), y1: Number(y1), x2: Number(x2), y2: Number(y2) });
    }
    if (segments.length) paths.push({ strokeWidth: Number(widthMatch[1]), segments });
  }
  if (!paths.length) throw new Error("Barcode SVG did not contain drawable vector paths.");
  return { width: Number(viewBox[1]), height: Number(viewBox[2]), paths, svg };
}

async function vectorBarcode(value: string): Promise<VectorBarcode> {
  const svg = (await engine()).toSVG({ bcid: "code128", text: value, scale: 3, height: 14, includetext: false, paddingwidth: 4, paddingheight: 4 });
  return parseVectorSvg(svg);
}

export async function barcodeSvg(value: string): Promise<string> { return (await vectorBarcode(value)).svg; }

export async function exportSvg(row: ProductRow): Promise<void> {
  download(new Blob([await barcodeSvg(row.barcode)], { type: "image/svg+xml;charset=utf-8" }), `${barcodeFilename(row.barcode)}.svg`);
}

export async function exportZip(rows: ProductRow[]): Promise<void> {
  const zip = new JSZip();
  const filenames = new Set<string>();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]; if (!row) continue;
    zip.file(uniqueFilename(row.barcode, filenames), await barcodeSvg(row.barcode));
  }
  download(await zip.generateAsync({ type: "blob" }), "barcode.zip");
}

export async function exportPdf(rows: ProductRow[]): Promise<void> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Barcode Generator Pro");
  pdf.setAuthor("PT Boenk Cosmetics");
  pdf.setCreator("Barcode Generator Pro");
  pdf.setSubject("Code128 Barcode");
  const a4Width = 595.28; const a4Height = 841.89;
  const margin = 72;
  for (const row of rows) {
    const barcode = await vectorBarcode(row.barcode);
    const page = pdf.addPage([a4Width, a4Height]);
    const availableWidth = a4Width - margin * 2; const availableHeight = a4Height - margin * 2;
    const scale = Math.min(availableWidth / barcode.width, availableHeight / barcode.height, 1);
    const offsetX = (a4Width - barcode.width * scale) / 2;
    const offsetY = (a4Height - barcode.height * scale) / 2;
    for (const path of barcode.paths) {
      for (const segment of path.segments) {
        page.drawLine({ start: { x: offsetX + segment.x1 * scale, y: offsetY + (barcode.height - segment.y1) * scale }, end: { x: offsetX + segment.x2 * scale, y: offsetY + (barcode.height - segment.y2) * scale }, thickness: path.strokeWidth * scale, color: rgb(0, 0, 0) });
      }
    }
  }
  const bytes = new Uint8Array(await pdf.save());
  download(new Blob([bytes.buffer], { type: "application/pdf" }), "barcode.pdf");
}
