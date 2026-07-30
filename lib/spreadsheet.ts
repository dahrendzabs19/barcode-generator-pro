import * as XLSX from "xlsx";
import type { ParseResult, ProductRow } from "@/types";

const barcodeHeaders = ["barcode", "code", "sku", "ean", "upc", "value"];
const nameHeaders = ["productname", "product name", "name", "title", "description"];

function cellText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function pickHeader(headers: string[], candidates: string[]): string | undefined {
  return headers.find((header) => candidates.includes(header.toLowerCase().trim()));
}

export async function parseSpreadsheet(file: File): Promise<ParseResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", raw: false });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return { rows: [], total: 0, validCount: 0, headers: [], error: "The file has no worksheets." };
    const sheet = workbook.Sheets[firstSheet];
    if (!sheet) return { rows: [], total: 0, validCount: 0, headers: [], error: "The first worksheet could not be read." };
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
    const headers = rawRows.length ? Object.keys(rawRows[0] ?? {}) : [];
    const barcodeHeader = pickHeader(headers, barcodeHeaders) ?? headers[0];
    const nameHeader = pickHeader(headers, nameHeaders);
    if (!barcodeHeader) return { rows: [], total: 0, validCount: 0, headers, error: "Add a header row and a barcode column." };
    const rows: ProductRow[] = rawRows.map((source, index) => {
      const barcode = cellText(source[barcodeHeader]);
      const error = barcode ? undefined : "Barcode value is empty.";
      const productName = nameHeader ? cellText(source[nameHeader]) : "";
      const extra = Object.fromEntries(headers.filter((header) => header !== barcodeHeader && header !== nameHeader).map((header) => [header, cellText(source[header])]));
      return { id: `${index}-${barcode}`, barcode, productName, valid: !error, ...(error ? { error } : {}), extra };
    });
    return { rows, total: rows.length, validCount: rows.filter((row) => row.valid).length, headers };
  } catch {
    return { rows: [], total: 0, validCount: 0, headers: [], error: "Unable to read this spreadsheet. Upload a valid CSV or XLSX file." };
  }
}
